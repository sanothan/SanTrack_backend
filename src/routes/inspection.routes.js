/**
 * Inspection Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const inspectionController = require('../controllers/inspection.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require auth
router.use(protect);

const createInspectionValidation = [
  body('village').isMongoId().withMessage('Village is required'),
  body('inspectionDate').optional().isISO8601().withMessage('Invalid date'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
  body('findings').optional().trim(),
  body('recommendations').optional().trim(),
  body('nextInspectionDate').optional().isISO8601().withMessage('Invalid date'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

const updateInspectionValidation = [
  param('id').isMongoId().withMessage('Invalid inspection ID'),
  body('village').optional().isMongoId().withMessage('Invalid village ID'),
  body('inspectionDate').optional().isISO8601().withMessage('Invalid date'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
  body('findings').optional().trim(),
  body('recommendations').optional().trim(),
  body('nextInspectionDate').optional().isISO8601().withMessage('Invalid date'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

// Create - Inspector only
router.post('/', authorize('inspector', 'admin'), createInspectionValidation, validate, inspectionController.createInspection);
router.get('/', inspectionController.getInspections);
router.get('/:id', param('id').isMongoId(), validate, inspectionController.getInspectionById);
// Update/Delete - Inspector (own) or Admin
router.put('/:id', authorize('inspector', 'admin'), updateInspectionValidation, validate, inspectionController.updateInspection);
router.delete('/:id', authorize('inspector', 'admin'), param('id').isMongoId(), validate, inspectionController.deleteInspection);

module.exports = router;
