/**
 * Issue Controller
 * Handles HTTP requests for issue/improvement tracking (Community Leader)
 */

const issueService = require('../services/issue.service');

/**
 * @route   POST /api/issues
 * @desc    Create issue
 * @access  Private/CommunityLeader
 */
const createIssue = async (req, res, next) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/issues
 * @desc    Get issues (filtered by role)
 * @access  Private
 */
const getIssues = async (req, res, next) => {
  try {
    const { page, limit, village, status, category } = req.query;
    const isLeader = req.user.role === 'communityLeader';
    const result = await issueService.getIssues({
      page,
      limit,
      village,
      status,
      category,
      reportedById: req.user.id,
      isLeader,
    });
    res.status(200).json({
      success: true,
      ...result,
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
    const issue = await issueService.getIssueById(req.params.id);
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
 * @desc    Update issue
 * @access  Private/CommunityLeader (own) or Admin
 */
const updateIssue = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const reporterId = isAdmin ? null : req.user.id;
    const issue = await issueService.updateIssue(
      req.params.id,
      req.body,
      reporterId,
      isAdmin
    );
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
 * @desc    Delete issue
 * @access  Private/CommunityLeader (own) or Admin
 */
const deleteIssue = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const reporterId = isAdmin ? null : req.user.id;
    await issueService.deleteIssue(req.params.id, reporterId, isAdmin);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Issue deleted successfully',
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
};
