const { User, FuelType, Pump, Sale, Inventory, Supplier, Delivery } = require('../models');

/**
 * Insert sample data to demonstrate the system functionality
 */
async function insertSampleData() {
    try {
        console.log('Inserting sample data...');
        
        // Create sample suppliers
        const [supplier1] = await Supplier.findOrCreate({
            where: { name: 'ABC Fuel Supply Co.' },
            defaults: {
                name: 'ABC Fuel Supply Co.',
                contactPerson: 'John Smith',
                phone: '+1234567890',
                email: 'john@abcfuel.com',
                address: '123 Fuel Street, Energy City',
                isActive: true
            }
        });
        
        const [supplier2] = await Supplier.findOrCreate({
            where: { name: 'Global Energy Ltd.' },
            defaults: {
                name: 'Global Energy Ltd.',
                contactPerson: 'Jane Doe',
                phone: '+0987654321',
                email: 'jane@globalenergy.com',
                address: '456 Energy Blvd, Power Town',
                isActive: true
            }
        });
        
        console.log('Sample suppliers created.');
        
        // Create additional fuel types
        const [premiumPetrol] = await FuelType.findOrCreate({
            where: { name: 'Premium Petrol' },
            defaults: {
                name: 'Premium Petrol',
                description: 'High octane premium unleaded petrol',
                unitPrice: 170.00,
                isActive: true
            }
        });
        
        const [autoDiesel] = await FuelType.findOrCreate({
            where: { name: 'Auto Diesel' },
            defaults: {
                name: 'Auto Diesel',
                description: 'High quality automotive diesel',
                unitPrice: 135.00,
                isActive: true
            }
        });
        
        console.log('Additional fuel types created.');
        
        // Create sample users (non-admin)
        const [cashier1] = await User.findOrCreate({
            where: { username: 'cashier1' },
            defaults: {
                username: 'cashier1',
                email: 'cashier1@hornfuel.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                role: 'cashier',
                isActive: true
            }
        });
        
        const [manager1] = await User.findOrCreate({
            where: { username: 'manager1' },
            defaults: {
                username: 'manager1',
                email: 'manager1@hornfuel.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                role: 'manager',
                isActive: true
            }
        });
        
        console.log('Sample users created.');
        
        // Create sample deliveries
        const [delivery1] = await Delivery.findOrCreate({
            where: { deliveryDate: new Date().toISOString().split('T')[0], supplierId: supplier1.id },
            defaults: {
                supplierId: supplier1.id,
                fuelTypeId: 1, // Assuming Petrol is ID 1
                quantity: 5000.00,
                unitPrice: 120.00,
                totalAmount: 600000.00,
                deliveryDate: new Date().toISOString().split('T')[0],
                receivedBy: 'Manager John',
                notes: 'Monthly supply delivery'
            }
        });
        
        const [delivery2] = await Delivery.findOrCreate({
            where: { deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], supplierId: supplier2.id },
            defaults: {
                supplierId: supplier2.id,
                fuelTypeId: 2, // Assuming Diesel is ID 2
                quantity: 4500.00,
                unitPrice: 110.00,
                totalAmount: 495000.00,
                deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                receivedBy: 'Manager Jane',
                notes: 'Emergency diesel supply'
            }
        });
        
        console.log('Sample deliveries created.');
        
        // Update inventory based on deliveries
        const petrolInventory = await Inventory.findOne({ where: { fuelTypeId: 1 } });
        if (petrolInventory) {
            await petrolInventory.update({
                currentLevel: parseFloat(petrolInventory.currentLevel) + 5000.00
            });
        }
        
        const dieselInventory = await Inventory.findOne({ where: { fuelTypeId: 2 } });
        if (dieselInventory) {
            await dieselInventory.update({
                currentLevel: parseFloat(dieselInventory.currentLevel) + 4500.00
            });
        }
        
        console.log('Inventory updated with deliveries.');
        
        // Create sample sales
        const pumps = await Pump.findAll({ limit: 4 });
        const users = await User.findAll({ where: { isActive: true }, limit: 2 });
        const fuelTypes = await FuelType.findAll({ where: { isActive: true }, limit: 3 });
        
        if (pumps.length > 0 && users.length > 0 && fuelTypes.length > 0) {
            // Sale 1
            await Sale.create({
                userId: users[0].id,
                pumpId: pumps[0].id,
                fuelTypeId: fuelTypes[0].id,
                quantity: 25.00,
                unitPrice: fuelTypes[0].unitPrice,
                totalAmount: 25.00 * parseFloat(fuelTypes[0].unitPrice),
                openingMeterReading: 1000.00,
                closingMeterReading: 1025.00,
                shiftDate: new Date().toISOString().split('T')[0],
                shift: 'morning',
                paymentMethod: 'cash'
            });
            
            // Sale 2
            await Sale.create({
                userId: users[1].id,
                pumpId: pumps[1].id,
                fuelTypeId: fuelTypes[1].id,
                quantity: 30.00,
                unitPrice: fuelTypes[1].unitPrice,
                totalAmount: 30.00 * parseFloat(fuelTypes[1].unitPrice),
                openingMeterReading: 2000.00,
                closingMeterReading: 2030.00,
                shiftDate: new Date().toISOString().split('T')[0],
                shift: 'afternoon',
                paymentMethod: 'card'
            });
            
            // Sale 3 - yesterday
            await Sale.create({
                userId: users[0].id,
                pumpId: pumps[2].id,
                fuelTypeId: fuelTypes[0].id,
                quantity: 40.00,
                unitPrice: fuelTypes[0].unitPrice,
                totalAmount: 40.00 * parseFloat(fuelTypes[0].unitPrice),
                openingMeterReading: 1500.00,
                closingMeterReading: 1540.00,
                shiftDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                shift: 'evening',
                paymentMethod: 'cash'
            });
            
            console.log('Sample sales created.');
        }
        
        // Update pump meter readings
        for (let i = 0; i < pumps.length && i < 3; i++) {
            await pumps[i].update({
                currentMeterReading: i === 0 ? 1025.00 : i === 1 ? 2030.00 : 1540.00,
                isOpen: i < 2 // First two pumps open
            });
        }
        
        console.log('Sample data insertion completed successfully!');
        console.log('\nSystem ready with:');
        console.log('- Default fuel types: Petrol, Diesel, Kerosene');
        console.log('- Premium fuel types: Premium Petrol, Auto Diesel');
        console.log('- 6 pumps distributed among fuel types');
        console.log('- Admin user: admin / password');
        console.log('- Additional users: cashier1, manager1 (password: password)');
        console.log('- Sample suppliers, deliveries and sales');
        console.log('- Initialized inventory levels');
    } catch (error) {
        console.error('Error inserting sample data:', error);
    }
}

module.exports = { insertSampleData };