/**
 * Village Controller
 * Handles HTTP requests for village management
 */

const Village = require('../models/Village');
const Facility = require('../models/Facility');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/villages
 * @desc    Create village (Admin only)
 * @access  Private/Admin
 */
const createVillage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, district, state, population, totalHouseholds, coordinates } = req.body;

    // Check for duplicate village in same district
    const existingVillage = await Village.findOne({ name, district });
    if (existingVillage) {
      return res.status(400).json({
        success: false,
        message: 'Village already exists in this district',
      });
    }

    const village = await Village.create({
      name,
      district,
      state,
      population,
      totalHouseholds,
      coordinates,
      updatedBy: req.user.id,
    });

    const populatedVillage = await Village.findById(village._id)
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedVillage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/villages
 * @desc    Get all villages with pagination and search
 * @access  Private
 */
const getVillages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.district) {
      filter.district = { $regex: req.query.district, $options: 'i' };
    }
    if (req.query.state) {
      filter.state = { $regex: req.query.state, $options: 'i' };
    }

    const villages = await Village.find(filter)
      .populate('updatedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Village.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: villages,
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
 * @route   GET /api/villages/:id
 * @desc    Get village by ID
 * @access  Private
 */
const getVillageById = async (req, res, next) => {
  try {
    const village = await Village.findById(req.params.id)
      .populate('updatedBy', 'name email');

    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found',
      });
    }

    // Get facilities count
    const facilitiesCount = await Facility.countDocuments({ village: village._id });

    const villageData = village.toObject();
    villageData.facilitiesCount = facilitiesCount;

    res.status(200).json({
      success: true,
      data: villageData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/villages/:id
 * @desc    Update village (Admin only)
 * @access  Private/Admin
 */
const updateVillage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, district, state, population, totalHouseholds, coordinates } = req.body;

    // Check if village exists
    let village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found',
      });
    }

    // Check for duplicate if name or district is being changed
    if (name && district && (name !== village.name || district !== village.district)) {
      const existingVillage = await Village.findOne({ name, district });
      if (existingVillage && existingVillage._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Village already exists in this district',
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (district !== undefined) updateData.district = district;
    if (state !== undefined) updateData.state = state;
    if (population !== undefined) updateData.population = population;
    if (totalHouseholds !== undefined) updateData.totalHouseholds = totalHouseholds;
    if (coordinates !== undefined) updateData.coordinates = coordinates;
    updateData.updatedBy = req.user.id;

    village = await Village.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: village,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/villages/:id
 * @desc    Delete village (Admin only)
 * @access  Private/Admin
 */
const deleteVillage = async (req, res, next) => {
  try {
    const village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found',
      });
    }

    // Check for associated facilities
    const facilitiesCount = await Facility.countDocuments({ village: village._id });
    if (facilitiesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete village with associated facilities',
      });
    }

    await Village.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Village deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/villages/:id/stats
 * @desc    Get village statistics
 * @access  Private
 */
const getVillageStats = async (req, res, next) => {
  try {
    const village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found',
      });
    }

    // Get facilities by type and condition
    const facilitiesByType = await Facility.aggregate([
      { $match: { village: village._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const facilitiesByCondition = await Facility.aggregate([
      { $match: { village: village._id } },
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    const totalFacilities = await Facility.countDocuments({ village: village._id });

    res.status(200).json({
      success: true,
      data: {
        village: {
          _id: village._id,
          name: village.name,
          district: village.district,
          state: village.state,
          population: village.population,
          totalHouseholds: village.totalHouseholds,
        },
        facilities: {
          total: totalFacilities,
          byType: facilitiesByType,
          byCondition: facilitiesByCondition,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVillage,
  getVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
  getVillageStats,
};
