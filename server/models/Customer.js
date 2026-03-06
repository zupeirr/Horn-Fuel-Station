const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vehicleReg: {
        type: DataTypes.STRING,
        allowNull: true // Vehicle Registration Number
    },
    creditLimit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00 // Current amount owed
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'customers',
    timestamps: true
});

module.exports = Customer;
