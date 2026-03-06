const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tank = sequelize.define('Tank', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tankNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    fuelTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'fuel_types',
            key: 'id'
        }
    },
    capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total capacity in liters'
    },
    currentLevel: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: 'Current fuel level in liters'
    },
    minLevel: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 1000.00,
        comment: 'Threshold for low fuel alert'
    },
    status: {
        type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'tanks',
    timestamps: true
});

module.exports = Tank;
