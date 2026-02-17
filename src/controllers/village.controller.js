/**
 * Village Controller
 * Handles HTTP requests for village management (Admin)
 */

const villageService = require('../services/village.service');

/**
 * @route   POST /api/villages
 * @desc    Create village
 * @access  Private/Admin
 */
const createVillage = async (req, res, next) => {
  try {
    const village = await villageService.createVillage(req.body);
    res.status(201).json({
      success: true,
      data: village,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/villages
 * @desc    Get all villages (paginated)
 * @access  Private
 */
const getAllVillages = async (req, res, next) => {
  try {
    const { page, limit, district, search, isActive } = req.query;
    const result = await villageService.getAllVillages({
      page,
      limit,
      district,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
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
 * @route   GET /api/villages/:id
 * @desc    Get village by ID
 * @access  Private
 */
const getVillageById = async (req, res, next) => {
  try {
    const village = await villageService.getVillageById(req.params.id);
    res.status(200).json({
      success: true,
      data: village,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/villages/:id
 * @desc    Update village
 * @access  Private/Admin
 */
const updateVillage = async (req, res, next) => {
  try {
    const village = await villageService.updateVillage(req.params.id, req.body);
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
 * @desc    Delete village
 * @access  Private/Admin
 */
const deleteVillage = async (req, res, next) => {
  try {
    await villageService.deleteVillage(req.params.id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Village deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVillage,
  getAllVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
};
