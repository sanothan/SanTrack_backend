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
    const error = new Error(errors.array().map((e) => e.msg).join(', '));
    error.statusCode = 400;
    error.errors = errors.array();
    return next(error);
  }
  next();
};

module.exports = { validate };
