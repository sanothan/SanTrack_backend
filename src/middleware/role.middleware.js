/**
 * Role Middleware
 * Restricts route access based on user role
 */

/**
 * @param  {...string} roles - Allowed roles (admin, inspector, communityLeader)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authorized');
      error.statusCode = 401;
      return next(error);
    }
    if (!roles.includes(req.user.role)) {
      const error = new Error(`Access denied. Required role: ${roles.join(' or ')}`);
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { authorize };
