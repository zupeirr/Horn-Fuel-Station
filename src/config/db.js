const { Sequelize } = require('sequelize');

// Determine database type based on environment configuration
const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // Can be 'mysql' or 'sqlite'

let sequelize;

if (DB_TYPE.toLowerCase() === 'mysql') {
    // Use MySQL
    sequelize = new Sequelize(
        process.env.DB_NAME || 'horn_fuel_station',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            port: process.env.DB_PORT || 3306,
            logging: console.log // Change to false in production
        }
    );
} else {
    // Use SQLite by default for easier setup
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: console.log // Change to false in production
    });
}

module.exports = sequelize;