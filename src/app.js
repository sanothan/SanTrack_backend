/**
 * Express Application Setup
 * MVC + Service layer architecture
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');

// Import routes
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(limiter);
app.use(cors({
  // Allow both common dev ports so Vite (5173) works as well as 3000
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'OK', 
    message: 'SanTrack API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
