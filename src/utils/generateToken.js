/**
 * JWT Token Generation Utility
 * Generates signed JWT for authentication
 */

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
};

module.exports = { generateToken, verifyToken };
