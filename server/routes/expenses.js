const express = require('express');
const router = express.Router();
const { Expense, User } = require('../models');
const auditLogger = require('../middleware/auditLogger');
const validate = require('../middleware/validate');
const Joi = require('joi');

const expenseSchema = Joi.object({
    category: Joi.string().valid('Salary', 'Maintenance', 'Electricity', 'Water', 'Generator Fuel', 'Taxes', 'Others').required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().allow(null, ''),
    expenseDate: Joi.date().iso().default(Date.now),
});

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            include: [{ model: User, as: 'user', attributes: ['username'] }]
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Record new expense
router.post('/', auditLogger('RECORD_EXPENSE', 'Expense'), validate(expenseSchema), async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            recordedBy: req.user.id
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
