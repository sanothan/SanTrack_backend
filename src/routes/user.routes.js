/**
 * User Routes (Admin only)
 */

const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require auth + admin role
router.use(protect, authorize('admin'));

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'inspector', 'communityLeader']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('village').optional().isMongoId().withMessage('Invalid village ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'inspector', 'communityLeader']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('village').optional().isMongoId().withMessage('Invalid village ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.post('/', createUserValidation, validate, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', param('id').isMongoId(), validate, userController.getUserById);
router.put('/:id', updateUserValidation, validate, userController.updateUser);
router.delete('/:id', param('id').isMongoId(), validate, userController.deleteUser);

module.exports = router;
