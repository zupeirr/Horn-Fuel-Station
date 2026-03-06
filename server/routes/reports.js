const express = require('express');
const router = express.Router();
const { Sale, Pump, FuelType, User, Inventory, Tank, Expense, Customer } = require('../models');
const { Op, Sequelize } = require('sequelize');
const ExcelJS = require('exceljs');

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

// Dashboard summary
router.get('/dashboard-summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        // 1. Basic Stats for Today
        const todayStats = await Sale.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'liters']
            ],
            where: { shiftDate: today }
        });

        // 2. Pump and Tank Stats
        const activePumps = await Pump.count({ where: { status: 'active' } });
        const tanks = await Tank.findAll({
            include: [{ model: FuelType, as: 'fuelType', attributes: ['name'] }]
        });
        const lowFuelAlerts = tanks.filter(t => parseFloat(t.currentLevel) <= parseFloat(t.minLevel)).length;

        // 3. 7-Day Sales Trend
        const salesTrend = await Sale.findAll({
            attributes: [
                'shiftDate',
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
            ],
            where: {
                shiftDate: { [Op.between]: [sevenDaysAgoStr, today] }
            },
            group: ['shiftDate'],
            order: [['shiftDate', 'ASC']]
        });

        // 4. Fuel Distribution (Revenue by Fuel Type)
        const fuelDistribution = await Sale.findAll({
            attributes: [
                [Sequelize.col('fuelType.name'), 'name'],
                [Sequelize.fn('SUM', Sequelize.col('Sale.totalAmount')), 'value']
            ],
            where: { shiftDate: today },
            include: [{ model: FuelType, as: 'fuelType', attributes: [] }],
            group: ['fuelType.name']
        });

        res.json({
            today: {
                revenue: parseFloat(todayStats?.dataValues?.revenue || 0),
                transactions: parseInt(todayStats?.dataValues?.count || 0),
                liters: parseFloat(todayStats?.dataValues?.liters || 0)
            },
            activePumps,
            lowFuelAlerts,
            tankLevels: tanks.map(t => ({
                name: t.tankNumber,
                fuelType: t.fuelType.name,
                level: parseFloat(t.currentLevel),
                capacity: parseFloat(t.capacity),
                percentage: (parseFloat(t.currentLevel) / parseFloat(t.capacity) * 100).toFixed(1)
            })),
            salesTrend: salesTrend.map(s => ({
                date: s.shiftDate,
                revenue: parseFloat(s.dataValues.revenue)
            })),
            fuelDistribution: fuelDistribution.map(f => ({
                name: f.dataValues.name,
                value: parseFloat(f.dataValues.value)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export all sales to Excel
router.get('/export/sales/excel', async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [
                { model: Pump, as: 'pump', attributes: ['pumpNumber'] },
                { model: FuelType, as: 'fuelType', attributes: ['name'] },
                { model: User, as: 'user', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Date', key: 'createdAt', width: 20 },
            { header: 'Pump', key: 'pump', width: 15 },
            { header: 'Fuel Type', key: 'fuelType', width: 15 },
            { header: 'Quantity (L)', key: 'quantity', width: 15 },
            { header: 'Unit Price', key: 'unitPrice', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'User', key: 'user', width: 15 }
        ];

        sales.forEach(sale => {
            worksheet.addRow({
                id: sale.id,
                createdAt: sale.createdAt.toLocaleString(),
                pump: sale.pump.pumpNumber,
                fuelType: sale.fuelType.name,
                quantity: parseFloat(sale.quantity),
                unitPrice: parseFloat(sale.unitPrice),
                totalAmount: parseFloat(sale.totalAmount),
                paymentMethod: sale.paymentMethod,
                user: sale.user.username
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Profit and Loss Report
router.get('/profit-loss', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let whereClause = {};
        if (startDate && endDate) {
            whereClause.shiftDate = { [Op.between]: [startDate, endDate] };
        }

        // 1. Total Revenue
        const revenue = await Sale.sum('totalAmount', { where: whereClause }) || 0;

        // 2. Cost of Fuel (Sum of deliveries in the period - Simplified)
        // In a real app, this would be based on FIFO/LIFO inventory cost
        const fuelCost = (await Sale.sum('quantity', { where: whereClause }) || 0) * 1.05; // Mock 1.05 per liter cost

        // 3. Operating Expenses
        const expenseWhere = {};
        if (startDate && endDate) {
            expenseWhere.expenseDate = { [Op.between]: [startDate, endDate] };
        }
        const totalExpenses = await Expense.sum('amount', { where: expenseWhere }) || 0;

        const netProfit = revenue - fuelCost - totalExpenses;

        res.json({
            revenue: parseFloat(revenue),
            fuelCost: parseFloat(fuelCost),
            operatingExpenses: parseFloat(totalExpenses),
            netProfit: parseFloat(netProfit),
            profitMargin: revenue > 0 ? (netProfit / revenue * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;