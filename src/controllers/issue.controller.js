/**
 * Issue Controller
 * Handles HTTP requests for issue management
 */

const Issue = require('../models/Issue');
const Facility = require('../models/Facility');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/issues
 * @desc    Create issue (Inspector/Community Leader)
 * @access  Private/Inspector/Community Leader
 */
const createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { facility, title, description, severity, photos } = req.body;

    // Validate facility exists
    const facilityExists = await Facility.findById(facility);
    if (!facilityExists) {
      return res.status(400).json({
        success: false,
        message: 'Facility not found',
      });
    }

    const issue = await Issue.create({
      facility,
      reportedBy: req.user.id,
      title,
      description,
      severity,
      photos: photos || [],
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('facility', 'name type village')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/issues
 * @desc    Get all issues with filtering
 * @access  Private
 */
const getIssues = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.facility) filter.facility = req.query.facility;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.severity) filter.severity = req.query.severity;

    const issues = await Issue.find(filter)
      .populate('facility', 'name type village')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/issues/:id
 * @desc    Get issue by ID
 * @access  Private
 */
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('facility', 'name type village')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/issues/:id
 * @desc    Update issue (Admin/Inspector)
 * @access  Private/Admin/Inspector
 */
const updateIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Check if issue exists
    let issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const { status, assignedTo, severity, title, description } = req.body;

    // Update fields
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (severity !== undefined) updateData.severity = severity;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // If status is being set to resolved, set resolvedAt
    if (status === 'resolved' && issue.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }

    issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('facility', 'name type village')
     .populate('reportedBy', 'name email')
     .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/issues/:id
 * @desc    Delete issue (Admin only)
 * @access  Private/Admin
 */
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/issues/:id/resolve
 * @desc    Resolve issue
 * @access  Private/Admin/Inspector
 */
const resolveIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { resolutionNotes } = req.body;

    // Check if issue exists
    let issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolutionNotes,
        resolvedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('facility', 'name type village')
     .populate('reportedBy', 'name email')
     .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  resolveIssue,
};
