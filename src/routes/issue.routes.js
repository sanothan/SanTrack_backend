/**
 * Issue Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const issueController = require('../controllers/issue.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require auth
router.use(protect);

const createIssueValidation = [
  body('village').isMongoId().withMessage('Village is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').optional().isIn(['Water Supply', 'Waste Management', 'Drainage', 'Hygiene', 'Toilet Facilities', 'Other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('location').optional().trim(),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

const updateIssueValidation = [
  param('id').isMongoId().withMessage('Invalid issue ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['Water Supply', 'Waste Management', 'Drainage', 'Hygiene', 'Toilet Facilities', 'Other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('location').optional().trim(),
  body('resolutionNotes').optional().trim(),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
];

// Create - Community Leader only
router.post('/', authorize('communityLeader', 'admin'), createIssueValidation, validate, issueController.createIssue);
router.get('/', issueController.getIssues);
router.get('/:id', param('id').isMongoId(), validate, issueController.getIssueById);
// Update/Delete - Community Leader (own) or Admin
router.put('/:id', authorize('communityLeader', 'admin'), updateIssueValidation, validate, issueController.updateIssue);
router.delete('/:id', authorize('communityLeader', 'admin'), param('id').isMongoId(), validate, issueController.deleteIssue);

module.exports = router;
