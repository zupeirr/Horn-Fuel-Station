const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    category: {
        type: DataTypes.ENUM('Salary', 'Maintenance', 'Electricity', 'Water', 'Generator Fuel', 'Taxes', 'Others'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expenseDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    recordedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'expenses',
    timestamps: true
});

module.exports = Expense;
