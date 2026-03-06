const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const logger = require('./utils/logger');
const { initializeDatabase } = require('./utils/dbInit');
const http = require('http');
const WebSocket = require('ws');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/fuel-types', authenticate, fuelTypeRoutes);
app.use('/api/pumps', authenticate, pumpRoutes);
app.use('/api/sales', authenticate, salesRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/reports', authenticate, reportRoutes);

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

// WebSocket Server for Pump Telemetry
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected to Pump Telemetry WS');
    
    // Send initial status
    ws.send(JSON.stringify({ type: 'STATUS', message: 'Connected to telemetry stream' }));

    // Simulate real-time pump data broadcast every 5 seconds
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