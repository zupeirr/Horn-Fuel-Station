const express = require('express');
const router = express.Router();
const { Sale, Pump, FuelType, User, Inventory } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Daily sales report
router.get('/daily-sales/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const sales = await Sale.findAll({
            where: { shiftDate: date },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: Pump,
                    as: 'pump',
                    attributes: ['id', 'pumpNumber'],
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['id', 'name', 'unitPrice']
                    }]
                }
            ]
        });
        
        // Group by fuel type
        const reportData = {};
        sales.forEach(sale => {
            // Ensure associations exist
            if (!sale.pump || !sale.pump.fuelType) {
                return;
            }
            
            const fuelTypeName = sale.pump.fuelType.name;
            
            if (!reportData[fuelTypeName]) {
                reportData[fuelTypeName] = {
                    fuelType: fuelTypeName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0,
                    averageUnitPrice: 0
                };
            }
            
            reportData[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
            reportData[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
            reportData[fuelTypeName].totalSales++;
        });
        
        // Calculate averages
        Object.keys(reportData).forEach(key => {
            const item = reportData[key];
            const totalUnits = item.totalQuantity;
            item.averageUnitPrice = totalUnits > 0 ? item.totalAmount / totalUnits : 0;
        });
        
        const reportArray = Object.values(reportData);
        
        // Calculate grand totals
        const grandTotal = reportArray.reduce((acc, item) => {
            acc.totalQuantity += item.totalQuantity;
            acc.totalAmount += item.totalAmount;
            acc.totalSales += item.totalSales;
            return acc;
        }, { totalQuantity: 0, totalAmount: 0, totalSales: 0 });
        
        res.json({
            date,
            sales: reportArray,
            grandTotal,
            totalShifts: [...new Set(sales.map(s => s.shift))].length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Monthly sales report
router.get('/monthly-sales/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0); // Last day of the month
        endDate.setDate(endDate.getDate() + 1); // Add one day to get the next month's first day
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const sales = await Sale.findAll({
            where: {
                shiftDate: {
                    [Op.between]: [startDate, endDateStr]
                }
            },
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name']
            }]
        });
        
        // Group by fuel type
        const monthlyReport = {};
        sales.forEach(sale => {
            // Ensure association exists
            if (!sale.fuelType) {
                return;
            }
            
            const fuelTypeName = sale.fuelType.name;
            
            if (!monthlyReport[fuelTypeName]) {
                monthlyReport[fuelTypeName] = {
                    fuelType: fuelTypeName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0
                };
            }
            
            monthlyReport[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
            monthlyReport[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
            monthlyReport[fuelTypeName].totalSales++;
        });
        
        const reportArray = Object.values(monthlyReport);
        
        // Calculate grand totals
        const grandTotal = reportArray.reduce((acc, item) => {
            acc.totalQuantity += item.totalQuantity;
            acc.totalAmount += item.totalAmount;
            acc.totalSales += item.totalSales;
            return acc;
        }, { totalQuantity: 0, totalAmount: 0, totalSales: 0 });
        
        res.json({
            period: `${year}-${month}`,
            sales: reportArray,
            grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Shift-wise sales report
router.get('/shift-report/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const sales = await Sale.findAll({
            where: { shiftDate: date },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: Pump,
                    as: 'pump',
                    attributes: ['id', 'pumpNumber'],
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });
        
        // Group by shift
        const shifts = ['morning', 'afternoon', 'night'];
        const shiftReport = {};
        
        shifts.forEach(shift => {
            const shiftSales = sales.filter(sale => sale.shift === shift);
            const shiftData = {};
            
            shiftSales.forEach(sale => {
                // Ensure associations exist
                if (!sale.pump || !sale.pump.fuelType) {
                    return;
                }
                
                const fuelTypeName = sale.pump.fuelType.name;
                
                if (!shiftData[fuelTypeName]) {
                    shiftData[fuelTypeName] = {
                        fuelType: fuelTypeName,
                        totalQuantity: 0,
                        totalAmount: 0,
                        totalSales: 0
                    };
                }
                
                shiftData[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
                shiftData[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
                shiftData[fuelTypeName].totalSales++;
            });
            
            shiftReport[shift] = {
                sales: Object.values(shiftData),
                totalQuantity: shiftSales.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0),
                totalAmount: shiftSales.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0),
                totalSales: shiftSales.length
            };
        });
        
        res.json({
            date,
            shifts: shiftReport
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fuel type comparison report
router.get('/fuel-comparison/:startDate/:endDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        
        const sales = await Sale.findAll({
            where: {
                shiftDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name']
            }]
        });
        
        // Group by fuel type
        const fuelComparison = {};
        sales.forEach(sale => {
            // Ensure association exists
            if (!sale.fuelType) {
                return;
            }
            
            const fuelTypeName = sale.fuelType.name;
            
            if (!fuelComparison[fuelTypeName]) {
                fuelComparison[fuelTypeName] = {
                    fuelType: fuelTypeName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0
                };
            }
            
            fuelComparison[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
            fuelComparison[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
            fuelComparison[fuelTypeName].totalSales++;
        });
        
        const reportArray = Object.values(fuelComparison);
        
        // Calculate percentages
        const grandTotal = reportArray.reduce((acc, item) => {
            acc.totalQuantity += item.totalQuantity;
            acc.totalAmount += item.totalAmount;
            acc.totalSales += item.totalSales;
            return acc;
        }, { totalQuantity: 0, totalAmount: 0, totalSales: 0 });
        
        reportArray.forEach(item => {
            item.percentageOfQuantity = grandTotal.totalQuantity > 0 
                ? parseFloat(((item.totalQuantity / grandTotal.totalQuantity) * 100).toFixed(2)) 
                : 0;
            item.percentageOfAmount = grandTotal.totalAmount > 0 
                ? parseFloat(((item.totalAmount / grandTotal.totalAmount) * 100).toFixed(2)) 
                : 0;
        });
        
        res.json({
            period: { startDate, endDate },
            comparison: reportArray,
            grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Revenue analytics
router.get('/revenue-analytics', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let whereClause = {};
        if (startDate && endDate) {
            whereClause.shiftDate = {
                [Op.between]: [startDate, endDate]
            };
        }
        
        // Get sales grouped by date
        const salesByDate = await Sale.findAll({
            attributes: [
                'shiftDate',
                [Sequelize.fn('SUM', Sequelize.col('Sale.totalAmount')), 'dailyRevenue'],
                [Sequelize.fn('COUNT', Sequelize.col('Sale.id')), 'transactionCount'],
                [Sequelize.fn('AVG', Sequelize.col('Sale.totalAmount')), 'avgTransactionValue']
            ],
            where: whereClause,
            group: ['shiftDate'],
            order: [['shiftDate', 'ASC']]
        });
        
        // Get sales grouped by fuel type
        const salesByFuelType = await Sale.findAll({
            attributes: [
                [Sequelize.col('Sale.fuelTypeId'), 'fuelTypeId'],
                [Sequelize.fn('SUM', Sequelize.col('Sale.totalAmount')), 'revenue'],
                [Sequelize.fn('SUM', Sequelize.col('Sale.quantity')), 'quantitySold'],
                [Sequelize.fn('COUNT', Sequelize.col('Sale.id')), 'transactionCount']
            ],
            where: whereClause,
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name']
            }],
            group: ['Sale.fuelTypeId', 'fuelType.id'],
            order: [[Sequelize.fn('SUM', Sequelize.col('Sale.totalAmount')), 'DESC']]
        });
        
        // Calculate overall metrics
        const overallMetrics = await Sale.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('Sale.totalAmount')), 'totalRevenue'],
                [Sequelize.fn('SUM', Sequelize.col('Sale.quantity')), 'totalQuantitySold'],
                [Sequelize.fn('COUNT', Sequelize.col('Sale.id')), 'totalTransactions'],
                [Sequelize.fn('AVG', Sequelize.col('Sale.totalAmount')), 'averageTransactionValue']
            ],
            where: whereClause
        });
        
        res.json({
            dailyRevenue: salesByDate.map(s => ({
                date: s.shiftDate,
                revenue: parseFloat(s.dataValues.dailyRevenue),
                transactions: parseInt(s.dataValues.transactionCount),
                avgValue: parseFloat(s.dataValues.avgTransactionValue)
            })),
            fuelTypeRevenue: salesByFuelType.map(s => ({
                fuelType: s.fuelType.name,
                revenue: parseFloat(s.dataValues.revenue),
                quantitySold: parseFloat(s.dataValues.quantitySold),
                transactions: parseInt(s.dataValues.transactionCount)
            })),
            overallMetrics: {
                totalRevenue: parseFloat(overallMetrics?.dataValues?.totalRevenue || 0),
                totalQuantitySold: parseFloat(overallMetrics?.dataValues?.totalQuantitySold || 0),
                totalTransactions: parseInt(overallMetrics?.dataValues?.totalTransactions || 0),
                averageTransactionValue: parseFloat(overallMetrics?.dataValues?.averageTransactionValue || 0)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;