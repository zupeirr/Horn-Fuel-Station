const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    pumpId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pumps',
            key: 'id'
        }
    },
    fuelTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'fuel_types',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    openingMeterReading: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    closingMeterReading: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shiftDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    shift: {
        type: DataTypes.ENUM('morning', 'afternoon', 'night'),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'credit'),
        defaultValue: 'cash'
    }
}, {
    tableName: 'sales',
    timestamps: true
});

module.exports = Sale;