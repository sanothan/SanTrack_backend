/**
 * Inspection Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const inspectionController = require('../controllers/inspection.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadImages } = require('../middleware/upload.middleware');

const router = express.Router();

// Validation rules
const createInspectionValidation = [
  body('facility').isMongoId().withMessage('Invalid facility ID'),
  body('date').isISO8601().withMessage('Valid inspection date is required'),
  body('score').isInt({ min: 1, max: 10 }).withMessage('Score must be between 1 and 10'),
  body('status').isIn(['good', 'needs_attention', 'critical']).withMessage('Invalid status'),
  body('notes').optional().trim(),
  body('recommendations').optional().trim(),
  body('nextInspectionDue').isISO8601().withMessage('Valid next inspection date is required'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

const updateInspectionValidation = [
  param('id').isMongoId().withMessage('Invalid inspection ID'),
  body('date').optional().isISO8601().withMessage('Valid inspection date is required'),
  body('score').optional().isInt({ min: 1, max: 10 }).withMessage('Score must be between 1 and 10'),
  body('status').optional().isIn(['good', 'needs_attention', 'critical']).withMessage('Invalid status'),
  body('notes').optional().trim(),
  body('recommendations').optional().trim(),
  body('nextInspectionDue').optional().isISO8601().withMessage('Valid next inspection date is required'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

// All routes require auth
router.use(protect);

// Authenticated user routes
router.get('/', inspectionController.getInspections);
router.get('/:id', param('id').isMongoId(), validate, inspectionController.getInspectionById);
router.get('/facilities/:facilityId/inspections', param('facilityId').isMongoId(), validate, inspectionController.getFacilityInspections);

// Inspector only routes
router.post('/', authorize('inspector'), createInspectionValidation, validate, inspectionController.createInspection);
router.put('/:id', authorize('inspector'), updateInspectionValidation, validate, inspectionController.updateInspection);

// Admin only routes
router.delete('/:id', authorize('admin'), param('id').isMongoId(), validate, inspectionController.deleteInspection);

module.exports = router;
