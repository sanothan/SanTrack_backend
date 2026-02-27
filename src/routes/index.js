/**
 * API Routes Index
 * Consolidates all API routes
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const villageRoutes = require('./village.routes');
const facilityRoutes = require('./facility.routes');
const inspectionRoutes = require('./inspection.routes');
const issueRoutes = require('./issue.routes');
const reportRoutes = require('./report.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

// API versioning
router.use('/api/v1', (req, res, next) => {
  req.apiVersion = 'v1';
  next();
});

// Route definitions
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/villages', villageRoutes);
router.use('/api/v1/facilities', facilityRoutes);
router.use('/api/v1/inspections', inspectionRoutes);
router.use('/api/v1/issues', issueRoutes);
router.use('/api/v1/reports', reportRoutes);
router.use('/api/v1/analytics', analyticsRoutes);

// API health check
router.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: req.apiVersion || 'v1',
  });
});

module.exports = router;
