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

// All routes require auth
router.use(protect);

const createVillageValidation = [
  body('name').trim().notEmpty().withMessage('Village name is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('region').optional().trim(),
  body('population').optional().isInt({ min: 0 }).withMessage('Population must be a positive number'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('assignedInspector').optional().isMongoId().withMessage('Invalid inspector ID'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const updateVillageValidation = [
  param('id').isMongoId().withMessage('Invalid village ID'),
  body('name').optional().trim().notEmpty().withMessage('Village name cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('region').optional().trim(),
  body('population').optional().isInt({ min: 0 }).withMessage('Population must be a positive number'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('assignedInspector').optional().isMongoId().withMessage('Invalid inspector ID'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// Create, update, delete - Admin only
router.post('/', authorize('admin'), createVillageValidation, validate, villageController.createVillage);
router.get('/', villageController.getAllVillages);
router.get('/:id', param('id').isMongoId(), validate, villageController.getVillageById);
router.put('/:id', authorize('admin'), updateVillageValidation, validate, villageController.updateVillage);
router.delete('/:id', authorize('admin'), param('id').isMongoId(), validate, villageController.deleteVillage);

module.exports = router;
