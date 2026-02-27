/**
 * Report Controller
 * Handles HTTP requests for report generation and management
 */

const Report = require('../models/Report');
const User = require('../models/User');
const Village = require('../models/Village');
const Facility = require('../models/Facility');
const Inspection = require('../models/Inspection');
const Issue = require('../models/Issue');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/reports
 * @desc    Generate analytics report (Admin only)
 * @access  Private/Admin
 */
const generateReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { title, type, dateRange, format } = req.body;

    // Generate report data based on type and date range
    const data = await generateReportData(type, dateRange);

    const report = await Report.create({
      title,
      type,
      generatedBy: req.user.id,
      dateRange,
      data,
      format: format || 'json',
    });

    const populatedReport = await Report.findById(report._id)
      .populate('generatedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports
 * @desc    Get all generated reports (Admin only)
 * @access  Private/Admin
 */
const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.type) filter.type = req.query.type;

    const reports = await Report.find(filter)
      .populate('generatedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reports,
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
 * @route   GET /api/reports/:id
 * @desc    Get report by ID (Admin only)
 * @access  Private/Admin
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/reports/:id
 * @desc    Regenerate report with fresh data (Admin only)
 * @access  Private/Admin
 */
const regenerateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Generate fresh data
    const data = await generateReportData(report.type, report.dateRange);

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { data },
      { new: true, runValidators: true }
    ).populate('generatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report (Admin only)
 * @access  Private/Admin
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:id/download
 * @desc    Download report in specified format
 * @access  Private/Admin
 */
const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // For now, return JSON data
    // In a real implementation, you would generate PDF/CSV files
    res.status(200).json({
      success: true,
      data: report.data,
      format: report.format,
      filename: `${report.title}.${report.format}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to generate report data
 */
const generateReportData = async (type, dateRange) => {
  const { startDate, endDate } = dateRange;
  const dateFilter = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  switch (type) {
    case 'monthly':
    case 'quarterly':
    case 'yearly':
      return await generateAnalyticsReport(dateFilter);
    case 'custom':
      return await generateCustomReport(dateFilter);
    default:
      throw new Error('Invalid report type');
  }
};

/**
 * Generate analytics report data
 */
const generateAnalyticsReport = async (dateFilter) => {
  // Get basic counts
  const [
    totalVillages,
    totalFacilities,
    totalInspections,
    totalIssues,
    totalUsers,
  ] = await Promise.all([
    Village.countDocuments(),
    Facility.countDocuments(),
    Inspection.countDocuments(dateFilter),
    Issue.countDocuments(dateFilter),
    User.countDocuments(),
  ]);

  // Get facilities by type
  const facilitiesByType = await Facility.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  // Get facilities by condition
  const facilitiesByCondition = await Facility.aggregate([
    { $group: { _id: '$condition', count: { $sum: 1 } } }
  ]);

  // Get issues by severity
  const issuesBySeverity = await Issue.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$severity', count: { $sum: 1 } } }
  ]);

  // Get issues by status
  const issuesByStatus = await Issue.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get inspection scores distribution
  const inspectionScores = await Inspection.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, avgScore: { $avg: '$score' }, minScore: { $min: '$score' }, maxScore: { $max: '$score' } } }
  ]);

  // Get inspections by status
  const inspectionsByStatus = await Inspection.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  return {
    summary: {
      totalVillages,
      totalFacilities,
      totalInspections,
      totalIssues,
      totalUsers,
    },
    facilities: {
      byType: facilitiesByType,
      byCondition: facilitiesByCondition,
    },
    issues: {
      bySeverity: issuesBySeverity,
      byStatus: issuesByStatus,
    },
    inspections: {
      scores: inspectionScores[0] || { avgScore: 0, minScore: 0, maxScore: 0 },
      byStatus: inspectionsByStatus,
    },
  };
};

/**
 * Generate custom report data
 */
const generateCustomReport = async (dateFilter) => {
  // This can be extended based on specific custom report requirements
  return await generateAnalyticsReport(dateFilter);
};

module.exports = {
  generateReport,
  getReports,
  getReportById,
  regenerateReport,
  deleteReport,
  downloadReport,
};
