const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { initializeDatabase } = require('./utils/dbInit');
const http = require('http');
const WebSocket = require('ws');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Common Rate Limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(generalLimiter);

// Specific limiter for login/auth (Strict)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 5 login attempts per hour
    message: 'Too many login attempts, please try again after an hour'
});

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Horn Fuel Station API',
            version: '1.0.0',
            description: 'Management API for fuel station point-of-sale, inventory, and reporting.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./server/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Import auth middleware
const { authenticate } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const fuelTypeRoutes = require('./routes/fuelTypes');
const pumpRoutes = require('./routes/pumps');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');
const customerRoutes = require('./routes/customers');
const expenseRoutes = require('./routes/expenses');
const shiftRoutes = require('./routes/shifts');
const tankRoutes = require('./routes/tanks');

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/fuel-types', authenticate, fuelTypeRoutes);
app.use('/api/pumps', authenticate, pumpRoutes);
app.use('/api/sales', authenticate, salesRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/customers', authenticate, customerRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);
app.use('/api/shifts', authenticate, shiftRoutes);
app.use('/api/tanks', authenticate, tankRoutes);

// Main route
app.get('/', (req, res) => {
    res.json({ message: 'Horn Fuel Station API Online' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled Exception', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ message: 'Something went wrong!' });
});

const server = http.createServer(app);

// WebSocket Server for Pump Telemetry and Alerts
const wss = new WebSocket.Server({ server });
app.set('wss', wss);

// Helper to broadcast messages to all connected clients
const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

wss.on('connection', (ws) => {
    logger.info('New client connected to WS');
    ws.send(JSON.stringify({ type: 'STATUS', message: 'Connected to Horn Fuel Real-time Stream' }));

    // Simulate real-time pump data broadcast every 10 seconds
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const mockTelemetry = {
                type: 'TELEMETRY',
                timestamp: new Date().toISOString(),
                pumps: [
                    { id: 1, flowRate: (Math.random() * 2 + 1).toFixed(2), totalDispensed: (Math.random() * 100).toFixed(2) },
                    { id: 2, flowRate: 0.00, totalDispensed: (Math.random() * 50).toFixed(2) }
                ]
            };
            ws.send(JSON.stringify(mockTelemetry));
        }
    }, 5000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected from Pump Telemetry WS');
    });
});

server.listen(PORT, () => {
    logger.info(`Horn Fuel Station Management System running on port ${PORT}`);
});

module.exports = { app, server, broadcast };