/**
 * User Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// Validation rules
const registerUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'inspector', 'community_leader']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('village').optional().isMongoId().withMessage('Invalid village ID'),
];

const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'inspector', 'community_leader']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('village').optional().isMongoId().withMessage('Invalid village ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

// Public routes (none for users - all require authentication)

// Admin only routes
router.post('/', protect, authorize('admin'), registerUserValidation, validate, userController.registerUser);
router.get('/', protect, authorize('admin'), userController.getUsers);
router.get('/:id', protect, authorize('admin', 'inspector'), param('id').isMongoId(), validate, userController.getUserById);
router.put('/:id', protect, authorize('admin'), updateUserValidation, validate, userController.updateUser);
router.delete('/:id', protect, authorize('admin'), param('id').isMongoId(), validate, userController.deleteUser);

// User profile routes (authenticated users)
router.get('/profile/me', protect, userController.getProfile);
router.put('/profile/me', protect, updateProfileValidation, validate, userController.updateProfile);

module.exports = router;
