/**
 * Express Application Setup
 * MVC + Service layer architecture
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const villageRoutes = require('./routes/village.routes');
const inspectionRoutes = require('./routes/inspection.routes');
const issueRoutes = require('./routes/issue.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SanTrack API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/issues', issueRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
