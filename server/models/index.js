const User = require('./User');
const FuelType = require('./FuelType');
const Pump = require('./Pump');
const Sale = require('./Sale');
const Inventory = require('./Inventory');
const Supplier = require('./Supplier');
const Delivery = require('./Delivery');
const AuditLog = require('./AuditLog');

// Define associations
User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });

FuelType.hasMany(Pump, { foreignKey: 'fuelTypeId', as: 'pumps' });
Pump.belongsTo(FuelType, { foreignKey: 'fuelTypeId', as: 'fuelType' });

FuelType.hasMany(Sale, { foreignKey: 'fuelTypeId', as: 'sales' });
Sale.belongsTo(FuelType, { foreignKey: 'fuelTypeId', as: 'fuelType' });

Pump.hasMany(Sale, { foreignKey: 'pumpId', as: 'sales' });
Sale.belongsTo(Pump, { foreignKey: 'pumpId', as: 'pump' });

FuelType.hasOne(Inventory, { foreignKey: 'fuelTypeId', as: 'inventory' });
Inventory.belongsTo(FuelType, { foreignKey: 'fuelTypeId', as: 'fuelType' });

Supplier.hasMany(Delivery, { foreignKey: 'supplierId', as: 'deliveries' });
Delivery.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

FuelType.hasMany(Delivery, { foreignKey: 'fuelTypeId', as: 'deliveries' });
Delivery.belongsTo(FuelType, { foreignKey: 'fuelTypeId', as: 'fuelType' });
 
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    User,
    FuelType,
    Pump,
    Sale,
    Inventory,
    Supplier,
    Delivery,
    AuditLog
};