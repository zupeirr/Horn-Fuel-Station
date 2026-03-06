const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null for system actions or unauthenticated attempts
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false // e.g., 'CREATE_SALE', 'DELETE_USER', 'LOGIN_SUCCESS', 'UPDATE_PRICE'
    },
    entityType: {
        type: DataTypes.STRING,
        allowNull: true // e.g., 'Sale', 'User', 'FuelType'
    },
    entityId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.TEXT, // Store JSON details or descriptive string
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false // Audit logs are immutable
});

module.exports = AuditLog;
