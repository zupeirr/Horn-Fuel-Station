const User = require('./User');
const FuelType = require('./FuelType');
const Pump = require('./Pump');
const Sale = require('./Sale');
const Inventory = require('./Inventory');
const Supplier = require('./Supplier');
const Delivery = require('./Delivery');

// Define associations
User.hasMany(Sale, { foreignKey: 'userId' });
Sale.belongsTo(User, { foreignKey: 'userId' });

FuelType.hasMany(Pump, { foreignKey: 'fuelTypeId' });
Pump.belongsTo(FuelType, { foreignKey: 'fuelTypeId' });

FuelType.hasMany(Sale, { foreignKey: 'fuelTypeId' });
Sale.belongsTo(FuelType, { foreignKey: 'fuelTypeId' });

Pump.hasMany(Sale, { foreignKey: 'pumpId' });
Sale.belongsTo(Pump, { foreignKey: 'pumpId' });

FuelType.hasOne(Inventory, { foreignKey: 'fuelTypeId' });
Inventory.belongsTo(FuelType, { foreignKey: 'fuelTypeId' });

Supplier.hasMany(Delivery, { foreignKey: 'supplierId' });
Delivery.belongsTo(Supplier, { foreignKey: 'supplierId' });

FuelType.hasMany(Delivery, { foreignKey: 'fuelTypeId' });
Delivery.belongsTo(FuelType, { foreignKey: 'fuelTypeId' });

module.exports = {
    User,
    FuelType,
    Pump,
    Sale,
    Inventory,
    Supplier,
    Delivery
};