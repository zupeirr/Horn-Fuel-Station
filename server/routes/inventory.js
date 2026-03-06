const express = require('express');
const router = express.Router();
const { Inventory, FuelType } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const inventoryItems = await Inventory.findAll({
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name', 'unitPrice']
            }]
        });
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory by fuel type
router.get('/fuel-type/:fuelTypeId', async (req, res) => {
    try {
        const inventory = await Inventory.findOne({
            where: { fuelTypeId: req.params.fuelTypeId },
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name', 'unitPrice']
            }]
        });
        
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory by fuel name
router.get('/by-name/:fuelName', async (req, res) => {
    try {
        const inventory = await Inventory.findOne({
            include: [{
                model: FuelType,
                as: 'fuelType',
                where: { name: req.params.fuelName }
            }]
        });
        
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update inventory level
router.patch('/update-level', async (req, res) => {
    try {
        const { fuelTypeId, newLevel } = req.body;
        
        const inventory = await Inventory.findOne({
            where: { fuelTypeId }
        });
        
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        
        await inventory.update({ 
            currentLevel: newLevel,
            lastUpdated: new Date()
        });
        
        // Check if level is below minimum and send alert
        if (inventory.minLevel && newLevel < inventory.minLevel) {
            // In a real system, this would trigger an alert notification
            console.log(`ALERT: Low inventory for fuel type ${inventory.fuelTypeId}. Current level: ${newLevel}`);
        }
        
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
    try {
        const lowStockItems = await Inventory.findAll({
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name', 'unitPrice']
            }],
            where: {
                [Op.and]: [
                    { currentLevel: { [Op.lt]: Sequelize.col('minLevel') } },
                    { minLevel: { [Op.ne]: null } }
                ]
            }
        });
        
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory summary
router.get('/summary', async (req, res) => {
    try {
        const inventorySummary = await Inventory.findAll({
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name', 'unitPrice']
            }],
            attributes: ['id', 'currentLevel', 'tankCapacity', 'minLevel', 'lastUpdated']
        });
        
        // Calculate overall statistics
        const totalCapacity = inventorySummary.reduce((sum, item) => sum + parseFloat(item.tankCapacity), 0);
        const totalCurrentLevel = inventorySummary.reduce((sum, item) => sum + parseFloat(item.currentLevel), 0);
        const utilizationRate = totalCapacity > 0 ? (totalCurrentLevel / totalCapacity) * 100 : 0;
        
        res.json({
            summary: inventorySummary,
            totalCapacity,
            totalCurrentLevel,
            utilizationRate: parseFloat(utilizationRate.toFixed(2))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;