/**
 * Facility Controller
 * Handles HTTP requests for facility management
 */

const Facility = require('../models/Facility');
const Inspection = require('../models/Inspection');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/facilities
 * @desc    Create facility (Admin only)
 * @access  Private/Admin
 */
const createFacility = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, type, village, location, condition, installedDate, notes } = req.body;

    // Validate village exists
    const Village = require('../models/Village');
    const villageExists = await Village.findById(village);
    if (!villageExists) {
      return res.status(400).json({
        success: false,
        message: 'Village not found',
      });
    }

    const facility = await Facility.create({
      name,
      type,
      village,
      location,
      condition,
      installedDate,
      notes,
      createdBy: req.user.id,
    });

    const populatedFacility = await Facility.findById(facility._id)
      .populate('village', 'name district state')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedFacility,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/facilities
 * @desc    Get all facilities with filtering
 * @access  Private
 */
const getFacilities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.village) filter.village = req.query.village;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.condition) filter.condition = req.query.condition;

    const facilities = await Facility.find(filter)
      .populate('village', 'name district state')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Facility.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: facilities,
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
 * @route   GET /api/facilities/:id
 * @desc    Get facility by ID
 * @access  Private
 */
const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('village', 'name district state')
      .populate('createdBy', 'name email');

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    // Get last inspection
    const lastInspection = await Inspection.findOne({ facility: facility._id })
      .sort({ date: -1 })
      .populate('inspector', 'name email');

    const facilityData = facility.toObject();
    facilityData.lastInspection = lastInspection;

    res.status(200).json({
      success: true,
      data: facilityData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/facilities/:id
 * @desc    Update facility (Admin/Inspector)
 * @access  Private/Admin/Inspector
 */
const updateFacility = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, type, location, condition, installedDate, notes } = req.body;

    // Check if facility exists
    let facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (location !== undefined) updateData.location = location;
    if (condition !== undefined) updateData.condition = condition;
    if (installedDate !== undefined) updateData.installedDate = installedDate;
    if (notes !== undefined) updateData.notes = notes;

    facility = await Facility.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('village', 'name district state').populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/facilities/:id
 * @desc    Delete facility (Admin only)
 * @access  Private/Admin
 */
const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    // Check for associated inspections
    const inspectionsCount = await Inspection.countDocuments({ facility: facility._id });
    if (inspectionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete facility with associated inspections',
      });
    }

    await Facility.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Facility deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/facilities/:id/images
 * @desc    Upload facility images
 * @access  Private/Admin/Inspector
 */
const uploadFacilityImages = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    // Add image URLs to facility
    const imageUrls = req.files.map(file => file.path); // Assuming multer with cloudinary
    facility.images.push(...imageUrls);
    await facility.save();

    res.status(200).json({
      success: true,
      data: {
        images: facility.images,
        uploadedImages: imageUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
  uploadFacilityImages,
};
