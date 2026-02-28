const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Server Error";
  let details = error.details;

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((e) => e.message);
  }

  if (error.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  const payload = { message };
  if (details) payload.details = details;

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
