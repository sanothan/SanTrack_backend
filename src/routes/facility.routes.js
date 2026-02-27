/**
 * Facility Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const facilityController = require('../controllers/facility.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadImages } = require('../middleware/upload.middleware');

const router = express.Router();

// Validation rules
const createFacilityValidation = [
  body('name').trim().notEmpty().withMessage('Facility name is required'),
  body('type').isIn(['toilet', 'well', 'water_tank', 'hand_pump']).withMessage('Invalid facility type'),
  body('village').isMongoId().withMessage('Invalid village ID'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be [longitude, latitude]'),
  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'critical']).withMessage('Invalid condition'),
  body('installedDate').isISO8601().withMessage('Valid installation date is required'),
  body('notes').optional().trim(),
];

const updateFacilityValidation = [
  param('id').isMongoId().withMessage('Invalid facility ID'),
  body('name').optional().trim().notEmpty().withMessage('Facility name cannot be empty'),
  body('type').optional().isIn(['toilet', 'well', 'water_tank', 'hand_pump']).withMessage('Invalid facility type'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be [longitude, latitude]'),
  body('location.coordinates.*').optional().isFloat().withMessage('Coordinates must be numbers'),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'critical']).withMessage('Invalid condition'),
  body('installedDate').optional().isISO8601().withMessage('Valid installation date is required'),
  body('notes').optional().trim(),
];

// All routes require auth
router.use(protect);

// Authenticated user routes
router.get('/', facilityController.getFacilities);
router.get('/:id', param('id').isMongoId(), validate, facilityController.getFacilityById);

// Admin/Inspector routes
router.post('/', authorize('admin', 'inspector'), createFacilityValidation, validate, facilityController.createFacility);
router.put('/:id', authorize('admin', 'inspector'), updateFacilityValidation, validate, facilityController.updateFacility);
router.post('/:id/images', authorize('admin', 'inspector'), uploadImages('facility-images', 'images', 5), facilityController.uploadFacilityImages);

// Admin only routes
router.delete('/:id', authorize('admin'), param('id').isMongoId(), validate, facilityController.deleteFacility);

module.exports = router;
