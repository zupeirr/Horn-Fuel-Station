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
        const reportData = sales.reduce((acc, sale) => {
            const fuelTypeName = sale.pump.fuelType.name;
            
            if (!acc[fuelTypeName]) {
                acc[fuelTypeName] = {
                    fuelType: fuelTypeName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0,
                    averageUnitPrice: 0
                };
            }
            
            acc[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
            acc[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
            acc[fuelTypeName].totalSales++;
        }, {});
        
        // Calculate averages
        Object.keys(reportData).forEach(key => {
            const item = reportData[key];
            const uniqueSales = sales.filter(s => s.pump.fuelType.name === key);
            const totalUnits = uniqueSales.reduce((sum, sale) => sum + parseFloat(sale.quantity), 0);
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
        const monthlyReport = sales.reduce((acc, sale) => {
            const fuelTypeName = sale.fuelType.name;
            
            if (!acc[fuelTypeName]) {
                acc[fuelTypeName] = {
                    fuelType: fuelTypeName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0
                };
            }
            
            acc[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
            acc[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
            acc[fuelTypeName].totalSales++;
        }, {});
        
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
            const shiftData = shiftSales.reduce((acc, sale) => {
                const fuelTypeName = sale.pump.fuelType.name;
                
                if (!acc[fuelTypeName]) {
                    acc[fuelTypeName] = {
                        fuelType: fuelTypeName,
                        totalQuantity: 0,
                        totalAmount: 0,
                        totalSales: 0
                    };
                }
                
                acc[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
                acc[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
                acc[fuelTypeName].totalSales++;
            }, {});
            
            shiftReport[shift] = {
                sales: Object.values(shiftData),
                totalQuantity: shiftSales.reduce((sum, s) => sum + parseFloat(s.quantity), 0),
                totalAmount: shiftSales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
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
        const fuelComparison = sales.reduce((acc, sale) => {
            const fuelTypeName = sale.fuelType.name;
            
            if (!acc[fuelTypeName]) {
                acc[fuelTypeName] = {
                    fuelType: fuelTypeName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0
                };
            }
            
            acc[fuelTypeName].totalQuantity += parseFloat(sale.quantity);
            acc[fuelTypeName].totalAmount += parseFloat(sale.totalAmount);
            acc[fuelTypeName].totalSales++;
        }, {});
        
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
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'dailyRevenue'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactionCount'],
                [Sequelize.fn('AVG', Sequelize.col('totalAmount')), 'avgTransactionValue']
            ],
            where: whereClause,
            group: ['shiftDate'],
            order: [['shiftDate', 'ASC']]
        });
        
        // Get sales grouped by fuel type
        const salesByFuelType = await Sale.findAll({
            attributes: [
                [Sequelize.col('fuelTypeId'), 'fuelTypeId']
            ],
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name']
            }],
            attributes: [
                [Sequelize.col('fuelTypeId'), 'fuelTypeId'],
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'quantitySold'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactionCount']
            ],
            where: whereClause,
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name']
            }],
            group: ['fuelTypeId', 'fuelType.id'],
            order: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'DESC']]
        });
        
        // Calculate overall metrics
        const overallMetrics = await Sale.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue'],
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalQuantitySold'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalTransactions'],
                [Sequelize.fn('AVG', Sequelize.col('totalAmount')), 'averageTransactionValue']
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
                totalRevenue: parseFloat(overallMetrics.dataValues.totalRevenue),
                totalQuantitySold: parseFloat(overallMetrics.dataValues.totalQuantitySold),
                totalTransactions: parseInt(overallMetrics.dataValues.totalTransactions),
                averageTransactionValue: parseFloat(overallMetrics.dataValues.averageTransactionValue)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;