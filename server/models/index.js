const User = require('./User');
const FuelType = require('./FuelType');
const Pump = require('./Pump');
const Sale = require('./Sale');
const Inventory = require('./Inventory');
const Supplier = require('./Supplier');
const Delivery = require('./Delivery');
const AuditLog = require('./AuditLog');
const Tank = require('./Tank');
const Customer = require('./Customer');
const Expense = require('./Expense');
const Shift = require('./Shift');

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

// Tank associations
FuelType.hasMany(Tank, { foreignKey: 'fuelTypeId', as: 'tanks' });
Tank.belongsTo(FuelType, { foreignKey: 'fuelTypeId', as: 'fuelType' });

// Pump to Tank association (Refined Inventory)
Tank.hasMany(Pump, { foreignKey: 'tankId', as: 'pumps' });
Pump.belongsTo(Tank, { foreignKey: 'tankId', as: 'tank' });

// Expense associations
User.hasMany(Expense, { foreignKey: 'recordedBy', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'recordedBy', as: 'user' });

// Shift associations
User.hasMany(Shift, { foreignKey: 'userId', as: 'shifts' });
Shift.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Customer and Sale associations
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

module.exports = {
    User,
    FuelType,
    Pump,
    Sale,
    Inventory,
    Supplier,
    Delivery,
    AuditLog,
    Tank,
    Customer,
    Expense,
    Shift
};