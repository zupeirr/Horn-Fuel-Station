const sequelize = require('../config/db');
const { User, FuelType, Pump, Sale, Inventory, Supplier, Delivery } = require('../models');
const { insertSampleData } = require('./sampleData');

/**
 * Initialize the database with default data
 */
async function initializeDatabase() {
    try {
        // Sync all models
        await sequelize.sync({ force: false }); // Use force: true to drop and recreate tables
        console.log('Database synced successfully!');
        
        // Create default fuel types if they don't exist
        const defaultFuelTypes = [
            { name: 'Petrol', description: 'Regular unleaded petrol', unitPrice: 150.00 },
            { name: 'Diesel', description: 'Regular diesel fuel', unitPrice: 130.00 },
            { name: 'Kerosene', description: 'Kerosene fuel', unitPrice: 120.00 }
        ];
        
        for (const fuelType of defaultFuelTypes) {
            const [instance, created] = await FuelType.findOrCreate({
                where: { name: fuelType.name },
                defaults: fuelType
            });
            
            if (created) {
                console.log(`Created fuel type: ${instance.name}`);
            } else {
                console.log(`Fuel type already exists: ${instance.name}`);
            }
        }
        
        // Create default pumps if they don't exist
        const fuelTypes = await FuelType.findAll();
        if (fuelTypes.length > 0) {
            for (let i = 1; i <= 6; i++) {
                const fuelType = fuelTypes[(i - 1) % fuelTypes.length]; // Distribute fuel types among pumps
                const [pump, created] = await Pump.findOrCreate({
                    where: { pumpNumber: `PUMP-${i}` },
                    defaults: {
                        pumpNumber: `PUMP-${i}`,
                        fuelTypeId: fuelType.id,
                        currentMeterReading: 0.00,
                        isOpen: false,
                        status: 'active'
                    }
                });
                
                if (created) {
                    console.log(`Created pump: ${pump.pumpNumber}`);
                } else {
                    console.log(`Pump already exists: ${pump.pumpNumber}`);
                }
            }
        }
        
        // Create default admin user if no users exist
        const userCount = await User.count();
        if (userCount === 0) {
            const adminUser = await User.create({
                username: 'admin',
                email: 'admin@hornfuel.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // Password: password
                role: 'admin'
            });
            console.log('Created admin user: admin / password');
        }
        
        // Initialize inventory for each fuel type
        for (const fuelType of fuelTypes) {
            const [inventory, created] = await Inventory.findOrCreate({
                where: { fuelTypeId: fuelType.id },
                defaults: {
                    fuelTypeId: fuelType.id,
                    tankCapacity: 10000.00, // 10,000 liters
                    currentLevel: 8000.00, // 8,000 liters initially
                    minLevel: 1000.00 // Alert when below 1,000 liters
                }
            });
            
            if (created) {
                console.log(`Created inventory record for: ${fuelType.name}`);
            } else {
                console.log(`Inventory record already exists for: ${fuelType.name}`);
            }
        }
        
        // Insert sample data for demonstration
        await insertSampleData();
        
        console.log('Database initialization completed!');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = { initializeDatabase };