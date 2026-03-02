const express = require('express');
const router = express.Router();
const { FuelType } = require('../models');

// Get all fuel types
router.get('/', async (req, res) => {
    try {
        const fuelTypes = await FuelType.findAll({
            where: { isActive: true }
        });
        res.json(fuelTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific fuel type
router.get('/:id', async (req, res) => {
    try {
        const fuelType = await FuelType.findByPk(req.params.id);
        if (!fuelType) {
            return res.status(404).json({ message: 'Fuel type not found' });
        }
        res.json(fuelType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new fuel type
router.post('/', async (req, res) => {
    try {
        const { name, description, unitPrice } = req.body;
        const fuelType = await FuelType.create({
            name,
            description,
            unitPrice
        });
        res.status(201).json(fuelType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a fuel type
router.put('/:id', async (req, res) => {
    try {
        const { name, description, unitPrice, isActive } = req.body;
        const fuelType = await FuelType.findByPk(req.params.id);
        
        if (!fuelType) {
            return res.status(404).json({ message: 'Fuel type not found' });
        }
        
        await fuelType.update({
            name: name || fuelType.name,
            description: description || fuelType.description,
            unitPrice: unitPrice || fuelType.unitPrice,
            isActive: isActive !== undefined ? isActive : fuelType.isActive
        });
        
        res.json(fuelType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a fuel type (soft delete by deactivating)
router.delete('/:id', async (req, res) => {
    try {
        const fuelType = await FuelType.findByPk(req.params.id);
        
        if (!fuelType) {
            return res.status(404).json({ message: 'Fuel type not found' });
        }
        
        await fuelType.update({ isActive: false });
        res.json({ message: 'Fuel type deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;