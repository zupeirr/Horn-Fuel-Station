const express = require('express');
const router = express.Router();
const { Sale, Pump, FuelType, User } = require('../models');
const { Op } = require('sequelize');

// Get all sales
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'role']
                },
                {
                    model: Pump,
                    as: 'pump',
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['id', 'name', 'unitPrice']
                    }]
                }
            ]
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sales by date range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate, shift } = req.query;
        
        let whereClause = {};
        
        if (startDate && endDate) {
            whereClause.shiftDate = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            whereClause.shiftDate = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            whereClause.shiftDate = {
                [Op.lte]: endDate
            };
        }
        
        if (shift) {
            whereClause.shift = shift;
        }
        
        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'role']
                },
                {
                    model: Pump,
                    as: 'pump',
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['id', 'name', 'unitPrice']
                    }]
                }
            ]
        });
        
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific sale
router.get('/:id', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'role']
                },
                {
                    model: Pump,
                    as: 'pump',
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['id', 'name', 'unitPrice']
                    }]
                }
            ]
        });
        
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new sale
router.post('/', async (req, res) => {
    try {
        const { userId, pumpId, fuelTypeId, quantity, unitPrice, openingMeterReading, closingMeterReading, shiftDate, shift, paymentMethod } = req.body;
        
        // Calculate total amount
        const totalAmount = parseFloat(quantity) * parseFloat(unitPrice);
        
        const sale = await Sale.create({
            userId,
            pumpId,
            fuelTypeId,
            quantity,
            unitPrice,
            totalAmount,
            openingMeterReading,
            closingMeterReading,
            shiftDate,
            shift,
            paymentMethod
        });
        
        // Update pump meter reading
        const pump = await Pump.findByPk(pumpId);
        await pump.update({ currentMeterReading: closingMeterReading });
        
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sales summary for a specific date/shift
router.get('/summary/:date/:shift', async (req, res) => {
    try {
        const { date, shift } = req.params;
        
        const sales = await Sale.findAll({
            where: {
                shiftDate: date,
                shift: shift
            },
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name']
            }]
        });
        
        // Calculate summary
        const summary = sales.reduce((acc, sale) => {
            const fuelName = sale.fuelType.name;
            
            if (!acc[fuelName]) {
                acc[fuelName] = {
                    fuelName,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSales: 0
                };
            }
            
            acc[fuelName].totalQuantity += parseFloat(sale.quantity);
            acc[fuelName].totalAmount += parseFloat(sale.totalAmount);
            acc[fuelName].totalSales++;
        }, {});
        
        const summaryArray = Object.values(summary);
        
        // Add grand totals
        const grandTotal = summaryArray.reduce((acc, item) => {
            acc.totalQuantity += item.totalQuantity;
            acc.totalAmount += item.totalAmount;
            acc.totalSales += item.totalSales;
            return acc;
        }, { totalQuantity: 0, totalAmount: 0, totalSales: 0 });
        
        res.json({
            summary: summaryArray,
            grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;