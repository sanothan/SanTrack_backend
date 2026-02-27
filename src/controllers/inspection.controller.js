/**
 * Inspection Controller
 * Handles HTTP requests for inspection management
 */

const Inspection = require('../models/Inspection');
const Facility = require('../models/Facility');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/inspections
 * @desc    Create inspection (Inspector only)
 * @access  Private/Inspector
 */
const createInspection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { facility, date, score, status, notes, recommendations, nextInspectionDue } = req.body;

    // Validate facility exists
    const facilityExists = await Facility.findById(facility);
    if (!facilityExists) {
      return res.status(400).json({
        success: false,
        message: 'Facility not found',
      });
    }

    const inspection = await Inspection.create({
      facility,
      inspector: req.user.id,
      date,
      score,
      status,
      notes,
      recommendations,
      nextInspectionDue,
      photos: req.body.photos || [],
    });

    // Update facility last inspection date
    await Facility.findByIdAndUpdate(facility, { lastInspection: date });

    const populatedInspection = await Inspection.findById(inspection._id)
      .populate('facility', 'name type condition')
      .populate('inspector', 'name email');

    res.status(201).json({
      success: true,
      data: populatedInspection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/inspections
 * @desc    Get all inspections with filtering
 * @access  Private
 */
const getInspections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.facility) filter.facility = req.query.facility;
    if (req.query.inspector) filter.inspector = req.query.inspector;
    if (req.query.status) filter.status = req.query.status;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const inspections = await Inspection.find(filter)
      .populate('facility', 'name type condition village')
      .populate('inspector', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Inspection.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: inspections,
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
 * @route   GET /api/inspections/:id
 * @desc    Get inspection by ID
 * @access  Private
 */
const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('facility', 'name type condition village')
      .populate('inspector', 'name email');

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/inspections/:id
 * @desc    Update inspection (Inspector who created it)
 * @access  Private/Inspector
 */
const updateInspection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Check if inspection exists and belongs to the inspector
    let inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      });
    }

    // Check if user is the inspector who created the inspection or admin
    if (inspection.inspector.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this inspection',
      });
    }

    const { date, score, status, notes, recommendations, nextInspectionDue, photos } = req.body;

    // Update fields
    const updateData = {};
    if (date !== undefined) updateData.date = date;
    if (score !== undefined) updateData.score = score;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (recommendations !== undefined) updateData.recommendations = recommendations;
    if (nextInspectionDue !== undefined) updateData.nextInspectionDue = nextInspectionDue;
    if (photos !== undefined) updateData.photos = photos;

    inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('facility', 'name type condition village').populate('inspector', 'name email');

    res.status(200).json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/inspections/:id
 * @desc    Delete inspection (Admin only)
 * @access  Private/Admin
 */
const deleteInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      });
    }

    await Inspection.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Inspection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/facilities/:facilityId/inspections
 * @desc    Get all inspections for a specific facility
 * @access  Private
 */
const getFacilityInspections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const facility = await Facility.findById(req.params.facilityId);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    const inspections = await Inspection.find({ facility: req.params.facilityId })
      .populate('inspector', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Inspection.countDocuments({ facility: req.params.facilityId });

    res.status(200).json({
      success: true,
      data: inspections,
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

module.exports = {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
  getFacilityInspections,
};
