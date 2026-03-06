const express = require('express');
const router = express.Router();
const { Tank, FuelType } = require('../models');
const auditLogger = require('../middleware/auditLogger');

// Get all tanks status
router.get('/', async (req, res) => {
    try {
        const tanks = await Tank.findAll({
            include: [{ model: FuelType, as: 'fuelType', attributes: ['name'] }]
        });
        res.json(tanks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Refill tank
router.post('/:id/refill', auditLogger('REFILL_TANK', 'Tank'), async (req, res) => {
    try {
        const { amount } = req.body;
        const tank = await Tank.findByPk(req.params.id);
        
        if (!tank) return res.status(404).json({ message: 'Tank not found' });
        
        const newLevel = parseFloat(tank.currentLevel) + parseFloat(amount);
        if (newLevel > tank.capacity) {
            return res.status(400).json({ message: 'Refill exceeds tank capacity' });
        }
        
        await tank.update({ currentLevel: newLevel });
        res.json({ message: 'Tank refilled successfully', tank });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
