/**
 * Village Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const villageController = require('../controllers/village.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// Validation rules
const createVillageValidation = [
  body('name').trim().notEmpty().withMessage('Village name is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('population').optional().isInt({ min: 0 }).withMessage('Population must be a positive integer'),
  body('totalHouseholds').optional().isInt({ min: 0 }).withMessage('Total households must be a positive integer'),
  body('coordinates.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('coordinates.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
];

const updateVillageValidation = [
  param('id').isMongoId().withMessage('Invalid village ID'),
  body('name').optional().trim().notEmpty().withMessage('Village name cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('population').optional().isInt({ min: 0 }).withMessage('Population must be a positive integer'),
  body('totalHouseholds').optional().isInt({ min: 0 }).withMessage('Total households must be a positive integer'),
  body('coordinates.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('coordinates.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
];

// All routes require auth
router.use(protect);

// Public routes (none for villages - all require authentication)

// Authenticated user routes
router.get('/', villageController.getVillages);
router.get('/:id', param('id').isMongoId(), validate, villageController.getVillageById);
router.get('/:id/stats', param('id').isMongoId(), validate, villageController.getVillageStats);

// Admin only routes
router.post('/', authorize('admin'), createVillageValidation, validate, villageController.createVillage);
router.put('/:id', authorize('admin'), updateVillageValidation, validate, villageController.updateVillage);
router.delete('/:id', authorize('admin'), param('id').isMongoId(), validate, villageController.deleteVillage);

module.exports = router;
