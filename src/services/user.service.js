/**
 * User Service
 * CRUD operations for user management (Admin)
 */

const User = require('../models/User');

/**
 * Create user
 */
const createUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }
  const user = await User.create(userData);
  return user;
};

/**
 * Get all users with pagination and filters
 */
const getAllUsers = async ({ page = 1, limit = 10, role, search, isActive }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).skip(skip).limit(limit).sort('-createdAt').select('-password').populate('village', 'name district'),
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
 * Get single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id).select('-password').populate('village', 'name district');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Update user
 */
const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select('-password')
    .populate('village', 'name district');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Delete user
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
