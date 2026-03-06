const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pump = sequelize.define('Pump', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pumpNumber: {
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
    currentMeterReading: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('active', 'maintenance', 'out_of_order'),
        defaultValue: 'active'
    }
}, {
    tableName: 'pumps',
    timestamps: true
});

module.exports = Pump;