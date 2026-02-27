/**
 * Report Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// Validation rules
const generateReportValidation = [
  body('title').trim().notEmpty().withMessage('Report title is required'),
  body('type').isIn(['monthly', 'quarterly', 'yearly', 'custom']).withMessage('Invalid report type'),
  body('dateRange.startDate').isISO8601().withMessage('Valid start date is required'),
  body('dateRange.endDate').isISO8601().withMessage('Valid end date is required'),
  body('format').optional().isIn(['pdf', 'csv', 'json']).withMessage('Invalid format'),
];

// All routes require auth and admin role
router.use(protect, authorize('admin'));

// Admin only routes
router.post('/', generateReportValidation, validate, reportController.generateReport);
router.get('/', reportController.getReports);
router.get('/:id', param('id').isMongoId(), validate, reportController.getReportById);
router.put('/:id', param('id').isMongoId(), validate, reportController.regenerateReport);
router.delete('/:id', param('id').isMongoId(), validate, reportController.deleteReport);
router.get('/:id/download', param('id').isMongoId(), validate, reportController.downloadReport);

module.exports = router;
