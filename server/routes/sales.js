const express = require('express');
const router = express.Router();
const { Sale, Pump, FuelType, User } = require('../models');
const { Op } = require('sequelize');
const auditLogger = require('../middleware/auditLogger');
const validate = require('../middleware/validate');
const { saleSchemas } = require('../utils/schemas');
const html_to_pdf = require('html-pdf-node');

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
router.post('/', auditLogger('CREATE_SALE', 'Sale'), validate(saleSchemas.create), async (req, res) => {
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

// Get receipt for a specific sale
router.get('/:id/receipt', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: Pump,
                    as: 'pump',
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['name']
                    }]
                }
            ]
        });
        
        if (!sale) {
            return res.status(404).send('Sale not found');
        }
        
        const html = `
        <html>
            <head>
                <style>
                    body { font-family: monospace; width: 300px; padding: 20px; border: 1px dashed #ccc; margin: auto; }
                    .center { text-align: center; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h2 class="center">HORN FUEL STATION</h2>
                <div class="center" style="margin-bottom:20px;">Receipt</div>
                <div class="row"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
                <div class="row"><span>Txn ID:</span><span>${sale.id}</span></div>
                <div class="row"><span>Pump:</span><span>${sale.pump.pumpNumber}</span></div>
                <div class="row"><span>Fuel Type:</span><span>${sale.pump.fuelType.name}</span></div>
                <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
                <div class="row"><span>Price/Liter:</span><span>$${parseFloat(sale.unitPrice).toFixed(2)}</span></div>
                <div class="row"><span>Liters:</span><span>${parseFloat(sale.quantity).toFixed(2)}</span></div>
                <div class="row total"><span>TOTAL:</span><span>$${parseFloat(sale.totalAmount).toFixed(2)}</span></div>
                <div class="center" style="margin-top:20px; font-size: 0.9em;">Thank you for your business!</div>
            </body>
        </html>
        `;
        
        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get PDF receipt for a specific sale
router.get('/:id/pdf', async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: Pump,
                    as: 'pump',
                    include: [{
                        model: FuelType,
                        as: 'fuelType',
                        attributes: ['name']
                    }]
                }
            ]
        });
        
        if (!sale) {
            return res.status(404).send('Sale not found');
        }
        
        const html = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; width: 400px; padding: 40px; border: 1px solid #eee; margin: auto; }
                    .center { text-align: center; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .total { font-weight: bold; font-size: 1.4em; border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; }
                    .header { color: #2563eb; margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <h1 class="center header">HORN FUEL STATION</h1>
                <div class="center" style="margin-bottom:30px; font-weight: bold; color: #666;">Official Receipt</div>
                <div class="row"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
                <div class="row"><span>Transaction ID:</span><span>${sale.id}</span></div>
                <div class="row"><span>Pump Station:</span><span>${sale.pump.pumpNumber}</span></div>
                <div class="row"><span>Fuel Grade:</span><span>${sale.pump.fuelType.name}</span></div>
                <div style="border-bottom: 1px dashed #ccc; margin: 20px 0;"></div>
                <div class="row"><span>Price per Liter:</span><span>$${parseFloat(sale.unitPrice).toFixed(2)}</span></div>
                <div class="row"><span>Volume Dispensed:</span><span>${parseFloat(sale.quantity).toFixed(2)} L</span></div>
                <div class="row total"><span>TOTAL AMOUNT:</span><span>$${parseFloat(sale.totalAmount).toFixed(2)}</span></div>
                <div class="center" style="margin-top:40px; font-size: 0.8em; color: #999;">
                    This is a computer-generated receipt.<br>
                    Thank you for choosing Horn Fuel Station!
                </div>
            </body>
        </html>
        `;

        const options = { format: 'A4' };
        const file = { content: html };

        html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${sale.id}.pdf`);
            res.send(pdfBuffer);
        });
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;