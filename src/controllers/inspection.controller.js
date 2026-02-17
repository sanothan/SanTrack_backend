/**
 * Inspection Controller
 * Handles HTTP requests for inspection management (Inspector)
 */

const inspectionService = require('../services/inspection.service');

/**
 * @route   POST /api/inspections
 * @desc    Create inspection
 * @access  Private/Inspector
 */
const createInspection = async (req, res, next) => {
  try {
    const inspection = await inspectionService.createInspection(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/inspections
 * @desc    Get inspections (filtered by role)
 * @access  Private
 */
const getInspections = async (req, res, next) => {
  try {
    const { page, limit, village, status } = req.query;
    const isInspector = req.user.role === 'inspector';
    const result = await inspectionService.getInspections({
      page,
      limit,
      village,
      status,
      inspectorId: req.user.id,
      isInspector,
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
 * @route   GET /api/inspections/:id
 * @desc    Get inspection by ID
 * @access  Private
 */
const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await inspectionService.getInspectionById(req.params.id);
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
 * @desc    Update inspection
 * @access  Private/Inspector (own) or Admin
 */
const updateInspection = async (req, res, next) => {
  try {
    const inspectorId = req.user.role === 'admin' ? null : req.user.id;
    const inspection = await inspectionService.updateInspection(
      req.params.id,
      req.body,
      inspectorId
    );
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
 * @desc    Delete inspection
 * @access  Private/Inspector (own) or Admin
 */
const deleteInspection = async (req, res, next) => {
  try {
    const inspectorId = req.user.role === 'admin' ? null : req.user.id;
    await inspectionService.deleteInspection(req.params.id, inspectorId);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Inspection deleted successfully',
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
};
