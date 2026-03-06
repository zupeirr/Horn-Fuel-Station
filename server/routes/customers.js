const express = require('express');
const router = express.Router();
const { Customer, Sale } = require('../models');
const auditLogger = require('../middleware/auditLogger');
const validate = require('../middleware/validate');
const Joi = require('joi');

const customerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    vehicleReg: Joi.string().allow(null, ''),
    creditLimit: Joi.number().min(0).default(0),
});

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get customer by ID with history
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create customer
router.post('/', auditLogger('CREATE_CUSTOMER', 'Customer'), validate(customerSchema), async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update customer
router.put('/:id', auditLogger('UPDATE_CUSTOMER', 'Customer'), validate(customerSchema), async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        await customer.update(req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
