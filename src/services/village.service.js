/**
 * Village Service
 * CRUD operations for village management (Admin)
 */

const Village = require('../models/Village');

/**
 * Create village
 */
const createVillage = async (villageData) => {
  const village = await Village.create(villageData);
  return village.populate('assignedInspector', 'name email');
};

/**
 * Get all villages with pagination
 */
const getAllVillages = async ({ page = 1, limit = 10, district, search, isActive }) => {
  const filter = {};
  if (district) filter.district = district;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { district: { $regex: search, $options: 'i' } },
      { region: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    Village.countDocuments(filter),
    Village.find(filter).skip(skip).limit(limit).sort('-createdAt').populate('assignedInspector', 'name email'),
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
 * Get village by ID
 */
const getVillageById = async (id) => {
  const village = await Village.findById(id).populate('assignedInspector', 'name email');
  if (!village) {
    const error = new Error('Village not found');
    error.statusCode = 404;
    throw error;
  }
  return village;
};

/**
 * Update village
 */
const updateVillage = async (id, updateData) => {
  const village = await Village.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('assignedInspector', 'name email');

  if (!village) {
    const error = new Error('Village not found');
    error.statusCode = 404;
    throw error;
  }
  return village;
};

/**
 * Delete village
 */
const deleteVillage = async (id) => {
  const village = await Village.findByIdAndDelete(id);
  if (!village) {
    const error = new Error('Village not found');
    error.statusCode = 404;
    throw error;
  }
  return village;
};

module.exports = {
  createVillage,
  getAllVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
};
