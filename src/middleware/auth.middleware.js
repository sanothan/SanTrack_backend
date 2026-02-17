/**
 * Auth Middleware
 * Protects routes - verifies JWT and attaches user to request
 */

const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');

/**
 * Protect routes - require valid JWT
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Not authorized - no token');
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }
    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token';
      error.statusCode = 401;
    }
    if (error.name === 'TokenExpiredError') {
      error.message = 'Token expired';
      error.statusCode = 401;
    }
    next(error);
  }
};

module.exports = { protect };
