const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Import routes
const authRoutes = require('./routes/auth');
const fuelTypeRoutes = require('./routes/fuelTypes');
const pumpRoutes = require('./routes/pumps');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fuel-types', fuelTypeRoutes);
app.use('/api/pumps', pumpRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);

// Main route
app.get('/', (req, res) => {
    res.render('index');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Horn Fuel Station Management System running on port ${PORT}`);
});