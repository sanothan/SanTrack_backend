/**
 * Issue Service
 * CRUD operations for issue/improvement tracking (Community Leader)
 */

const Issue = require('../models/Issue');

const getPaginatedResults = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    Issue.countDocuments(query),
    Issue.find(query).skip(skip).limit(limit).sort('-createdAt'),
  ]);
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create issue
 */
const createIssue = async (issueData, reportedById) => {
  const issue = await Issue.create({
    ...issueData,
    reportedBy: reportedById,
  });
  return issue;
};

/**
 * Get issues (filtered by role)
 */
const getIssues = async ({ page = 1, limit = 10, village, status, category, reportedById, isLeader }) => {
  const query = {};

  if (village) query.village = village;
  if (status) query.status = status;
  if (category) query.category = category;
  if (isLeader && reportedById) query.reportedBy = reportedById;

  return getPaginatedResults(query, page, limit);
};

/**
 * Get issue by ID
 */
const getIssueById = async (id) => {
  const issue = await Issue.findById(id);
  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }
  return issue;
};

/**
 * Update issue
 */
const updateIssue = async (id, updateData, reporterId = null, isAdmin = false) => {
  const issue = await Issue.findById(id);
  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }
  // Community leader can only update their own issues (unless admin)
  if (!isAdmin && reporterId && issue.reportedBy.toString() !== reporterId.toString()) {
    const error = new Error('Not authorized to update this issue');
    error.statusCode = 403;
    throw error;
  }
  if (updateData.status === 'Completed') {
    updateData.resolvedAt = new Date();
  }
  Object.assign(issue, updateData);
  await issue.save();
  return issue;
};

/**
 * Delete issue
 */
const deleteIssue = async (id, reporterId = null, isAdmin = false) => {
  const issue = await Issue.findById(id);
  if (!issue) {
    const error = new Error('Issue not found');
    error.statusCode = 404;
    throw error;
  }
  if (!isAdmin && reporterId && issue.reportedBy.toString() !== reporterId.toString()) {
    const error = new Error('Not authorized to delete this issue');
    error.statusCode = 403;
    throw error;
  }
  await issue.deleteOne();
  return issue;
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
