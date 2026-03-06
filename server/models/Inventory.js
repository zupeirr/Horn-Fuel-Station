const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fuelTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'fuel_types',
            key: 'id'
        }
    },
    tankCapacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    currentLevel: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    minLevel: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 500.00 // Alert when below this level
    },
    maxLevel: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00 // Will be calculated based on tank capacity
    },
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'inventory',
    timestamps: true
});

module.exports = Inventory;