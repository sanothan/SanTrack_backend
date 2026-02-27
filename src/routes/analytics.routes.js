/**
 * Analytics Routes
 */

const express = require('express');
const Village = require('../models/Village');
const Facility = require('../models/Facility');
const Inspection = require('../models/Inspection');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require auth and admin role
router.use(protect, authorize('admin'));

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics
 * @access  Private/Admin
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    // Get basic counts
    const [
      totalVillages,
      totalFacilities,
      totalInspections,
      totalIssues,
      totalUsers,
      activeIssues,
      pendingInspections,
    ] = await Promise.all([
      Village.countDocuments(),
      Facility.countDocuments(),
      Inspection.countDocuments(),
      Issue.countDocuments(),
      User.countDocuments(),
      Issue.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      Inspection.countDocuments({ date: { $gte: new Date() } }),
    ]);

    // Get recent activity
    const recentInspections = await Inspection.find()
      .populate('facility', 'name')
      .populate('inspector', 'name')
      .sort({ date: -1 })
      .limit(5);

    const recentIssues = await Issue.find()
      .populate('facility', 'name')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get facilities by condition
    const facilitiesByCondition = await Facility.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    // Get issues by severity
    const issuesBySeverity = await Issue.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalVillages,
          totalFacilities,
          totalInspections,
          totalIssues,
          totalUsers,
          activeIssues,
          pendingInspections,
        },
        recentActivity: {
          inspections: recentInspections,
          issues: recentIssues,
        },
        charts: {
          facilitiesByCondition,
          issuesBySeverity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analytics/villages
 * @desc    Get village-level analytics
 * @access  Private/Admin
 */
router.get('/villages', async (req, res, next) => {
  try {
    const villageAnalytics = await Village.aggregate([
      {
        $lookup: {
          from: 'facilities',
          localField: '_id',
          foreignField: 'village',
          as: 'facilities',
        },
      },
      {
        $lookup: {
          from: 'issues',
          localField: '_id',
          foreignField: 'village',
          as: 'issues',
        },
      },
      {
        $project: {
          name: 1,
          district: 1,
          state: 1,
          population: 1,
          totalHouseholds: 1,
          facilitiesCount: { $size: '$facilities' },
          issuesCount: { $size: '$issues' },
          activeIssuesCount: {
            $size: {
              $filter: {
                input: '$issues',
                cond: { $in: ['$$this.status', ['pending', 'in_progress']] },
              },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: villageAnalytics,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
