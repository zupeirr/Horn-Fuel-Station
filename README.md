# Horn Fuel Station Management System

A comprehensive fuel station management system built with Node.js, Express, and MySQL.

## Features

- **Fuel Type Management**: Manage different fuel types (Petrol, Diesel, Kerosene) with pricing
- **Pump Management**: Track pump meters, status, and operations
- **Sales Management**: Record and track fuel sales with shift-based reporting
- **Inventory Tracking**: Monitor fuel tank levels and receive low-stock alerts
- **Reporting**: Generate daily, monthly, and analytical reports
- **User Authentication**: Role-based access control (Admin, Manager, Cashier)

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: MySQL with Sequelize ORM
- **Frontend**: EJS templating engine with Bootstrap
- **Authentication**: JWT-based authentication
- **Styling**: Custom CSS with Bootstrap 5

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` file
4. Create the database and run migrations
5. Start the server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DB_HOST=localhost
DB_NAME=horn_fuel_station
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Fuel Types
- `GET /api/fuel-types` - Get all fuel types
- `POST /api/fuel-types` - Create a new fuel type
- `PUT /api/fuel-types/:id` - Update a fuel type
- `DELETE /api/fuel-types/:id` - Deactivate a fuel type

### Pumps
- `GET /api/pumps` - Get all pumps
- `POST /api/pumps` - Create a new pump
- `PUT /api/pumps/:id` - Update a pump
- `PATCH /api/pumps/:id/meter` - Update pump meter reading
- `PATCH /api/pumps/:id/toggle` - Toggle pump status

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create a new sale
- `GET /api/sales/summary/:date/:shift` - Get sales summary for a date/shift

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/summary` - Get inventory summary
- `PATCH /api/inventory/update-level` - Update inventory level
- `GET /api/inventory/alerts/low-stock` - Get low stock alerts

### Reports
- `GET /api/reports/daily-sales/:date` - Get daily sales report
- `GET /api/reports/monthly-sales/:year/:month` - Get monthly sales report
- `GET /api/reports/revenue-analytics` - Get revenue analytics

## Database Schema

The system uses the following main tables:

- `users` - Store user information with roles
- `fuel_types` - Define different fuel types and prices
- `pumps` - Track fuel pumps and their status
- `sales` - Record fuel sales transactions
- `inventory` - Track fuel inventory levels
- `suppliers` - Manage fuel suppliers
- `deliveries` - Track fuel deliveries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.