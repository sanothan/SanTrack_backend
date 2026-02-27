/**
 * Validation Middleware
 * Wraps express-validator for request validation
 */

const { validationResult } = require('express-validator');

/**
 * Runs validation and returns errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { validate };
