/**
 * Inspection Service
 * CRUD operations for inspection management (Inspector)
 */

const Inspection = require('../models/Inspection');
const mongoose = require('mongoose');

const getPaginatedResults = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    Inspection.countDocuments(query),
    Inspection.find(query).skip(skip).limit(limit).sort('-inspectionDate'),
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
 * Create inspection
 */
const createInspection = async (inspectionData, inspectorId) => {
  const inspection = await Inspection.create({
    ...inspectionData,
    inspector: inspectorId,
  });
  return inspection;
};

/**
 * Get inspections (filtered by role)
 */
const getInspections = async ({ page = 1, limit = 10, village, status, inspectorId, isInspector }) => {
  const query = {};

  if (village) query.village = village;
  if (status) query.status = status;
  if (isInspector && inspectorId) query.inspector = inspectorId;

  return getPaginatedResults(query, page, limit);
};

/**
 * Get inspection by ID
 */
const getInspectionById = async (id) => {
  const inspection = await Inspection.findById(id);
  if (!inspection) {
    const error = new Error('Inspection not found');
    error.statusCode = 404;
    throw error;
  }
  return inspection;
};

/**
 * Update inspection
 */
const updateInspection = async (id, updateData, inspectorId = null) => {
  const inspection = await Inspection.findById(id);
  if (!inspection) {
    const error = new Error('Inspection not found');
    error.statusCode = 404;
    throw error;
  }
  // Inspector can only update their own inspections
  if (inspectorId && inspection.inspector.toString() !== inspectorId.toString()) {
    const error = new Error('Not authorized to update this inspection');
    error.statusCode = 403;
    throw error;
  }
  Object.assign(inspection, updateData);
  await inspection.save();
  return inspection;
};

/**
 * Delete inspection
 */
const deleteInspection = async (id, inspectorId = null) => {
  const inspection = await Inspection.findById(id);
  if (!inspection) {
    const error = new Error('Inspection not found');
    error.statusCode = 404;
    throw error;
  }
  if (inspectorId && inspection.inspector.toString() !== inspectorId.toString()) {
    const error = new Error('Not authorized to delete this inspection');
    error.statusCode = 403;
    throw error;
  }
  await inspection.deleteOne();
  return inspection;
};

module.exports = {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
};
