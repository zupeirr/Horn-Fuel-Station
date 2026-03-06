const Joi = require('joi');

const authSchemas = {
    login: Joi.object({
        identifier: Joi.alternatives().try(
            Joi.string().email(),
            Joi.string().min(3)
        ).required(),
        password: Joi.string().min(6).required()
    }),
    register: Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'cashier').default('cashier')
    })
};

const saleSchemas = {
    create: Joi.object({
        userId: Joi.string().required(),
        customerId: Joi.string().guid({ version: 'uuidv4' }).optional(),
        pumpId: Joi.number().integer().required(),
        fuelTypeId: Joi.number().integer().required(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
        openingMeterReading: Joi.number().min(0).required(),
        closingMeterReading: Joi.number().min(Joi.ref('openingMeterReading')).required(),
        shiftDate: Joi.date().iso().required(),
        shift: Joi.string().valid('Morning', 'Afternoon', 'Night', 'morning', 'afternoon', 'night').required(),
        paymentMethod: Joi.string().valid('Cash', 'Card', 'Mobile', 'Credit', 'cash', 'card', 'mobile', 'credit').required()
    })
};

module.exports = {
    authSchemas,
    saleSchemas
};
