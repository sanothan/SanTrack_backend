/**
 * Issue Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const issueController = require('../controllers/issue.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadImages } = require('../middleware/upload.middleware');

const router = express.Router();

// Validation rules
const createIssueValidation = [
  body('facility').isMongoId().withMessage('Invalid facility ID'),
  body('title').trim().notEmpty().withMessage('Issue title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

const updateIssueValidation = [
  param('id').isMongoId().withMessage('Invalid issue ID'),
  body('status').optional().isIn(['pending', 'in_progress', 'resolved']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('title').optional().trim().notEmpty().withMessage('Issue title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
];

const resolveIssueValidation = [
  param('id').isMongoId().withMessage('Invalid issue ID'),
  body('resolutionNotes').optional().trim(),
];

// All routes require auth
router.use(protect);

// Authenticated user routes
router.get('/', issueController.getIssues);
router.get('/:id', param('id').isMongoId(), validate, issueController.getIssueById);

// Inspector/Community Leader routes
router.post('/', authorize('inspector', 'community_leader'), createIssueValidation, validate, issueController.createIssue);

// Admin/Inspector routes
router.put('/:id', authorize('admin', 'inspector'), updateIssueValidation, validate, issueController.updateIssue);
router.patch('/:id/resolve', authorize('admin', 'inspector'), resolveIssueValidation, validate, issueController.resolveIssue);

// Admin only routes
router.delete('/:id', authorize('admin'), param('id').isMongoId(), validate, issueController.deleteIssue);

module.exports = router;
