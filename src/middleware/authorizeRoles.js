const ApiError = require("../utils/ApiError");

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden"));
  }

  return next();
};

module.exports = authorizeRoles;
