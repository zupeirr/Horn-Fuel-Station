const express = require('express');
const router = express.Router();
const { Pump, FuelType } = require('../models');

// Get all pumps with fuel type details
router.get('/', async (req, res) => {
    try {
        const pumps = await Pump.findAll({
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name', 'unitPrice']
            }]
        });
        res.json(pumps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific pump
router.get('/:id', async (req, res) => {
    try {
        const pump = await Pump.findByPk(req.params.id, {
            include: [{
                model: FuelType,
                as: 'fuelType',
                attributes: ['id', 'name', 'unitPrice']
            }]
        });
        
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        
        res.json(pump);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new pump
router.post('/', async (req, res) => {
    try {
        const { pumpNumber, fuelTypeId } = req.body;
        const pump = await Pump.create({
            pumpNumber,
            fuelTypeId
        });
        res.status(201).json(pump);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a pump
router.put('/:id', async (req, res) => {
    try {
        const { pumpNumber, fuelTypeId, currentMeterReading, isOpen, status } = req.body;
        const pump = await Pump.findByPk(req.params.id);
        
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        
        await pump.update({
            pumpNumber: pumpNumber || pump.pumpNumber,
            fuelTypeId: fuelTypeId || pump.fuelTypeId,
            currentMeterReading: currentMeterReading !== undefined ? currentMeterReading : pump.currentMeterReading,
            isOpen: isOpen !== undefined ? isOpen : pump.isOpen,
            status: status || pump.status
        });
        
        res.json(pump);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update pump meter reading
router.patch('/:id/meter', async (req, res) => {
    try {
        const { newMeterReading } = req.body;
        const pump = await Pump.findByPk(req.params.id);
        
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        
        await pump.update({ currentMeterReading: newMeterReading });
        res.json(pump);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Open/close pump
router.patch('/:id/toggle', async (req, res) => {
    try {
        const pump = await Pump.findByPk(req.params.id);
        
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        
        await pump.update({ isOpen: !pump.isOpen });
        res.json({ 
            message: `Pump ${pump.isOpen ? 'closed' : 'opened'} successfully`,
            pump
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;