const express = require('express');
const router = express.Router();
const { Shift, User } = require('../models');
const auditLogger = require('../middleware/auditLogger');

// Start a shift
router.post('/start', auditLogger('START_SHIFT', 'Shift'), async (req, res) => {
    try {
        const { shiftType } = req.body;
        
        // Ensure no active shift for this user
        const activeShift = await Shift.findOne({
            where: { userId: req.user.id, status: 'Ongoing' }
        });
        
        if (activeShift) {
            return res.status(400).json({ message: 'You already have an active shift' });
        }

        const shift = await Shift.create({
            userId: req.user.id,
            shiftType,
            startTime: new Date(),
            status: 'Ongoing'
        });
        
        res.status(201).json(shift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// End a shift
router.post('/end', auditLogger('END_SHIFT', 'Shift'), async (req, res) => {
    try {
        const shift = await Shift.findOne({
            where: { userId: req.user.id, status: 'Ongoing' }
        });
        
        if (!shift) {
            return res.status(404).json({ message: 'No active shift found' });
        }

        await shift.update({
            endTime: new Date(),
            status: 'Completed'
        });
        
        res.json(shift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get shift history (Admin only)
router.get('/history', async (req, res) => {
    try {
        const history = await Shift.findAll({
            include: [{ model: User, as: 'user', attributes: ['username', 'role'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
