/**
 * Auth Service
 * Handles authentication business logic
 */

const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * Register a new user
 */
const register = async (userData) => {
  const { name, email, password, role, phone, village } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'communityLeader',
    phone,
    village: village || null,
  });

  const token = generateToken(user._id);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      village: user.village,
    },
    token,
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is deactivated');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      village: user.village,
    },
    token,
  };
};

/**
 * Get current user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId).populate('village', 'name district');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = {
  register,
  login,
  getMe,
};
