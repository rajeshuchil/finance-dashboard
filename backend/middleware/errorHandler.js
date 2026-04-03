/**
 * Global error handling middleware for Express.
 * Catches unhandled errors and translates specific database errors 
 * (like Mongoose validation) into standard HTTP responses.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Handle malformed MongoDB ObjectIds
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID';
  }

  // Handle MongoDB duplicate key violations (e.g. attempting to register an existing email)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0];
    message = duplicateField
      ? `${duplicateField} already exists`
      : 'Duplicate field value entered';
  }

  // Extract friendly messages from Mongoose validation failures
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Intercept authentication-related library errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  res.status(statusCode).json({
    error: message,
    // Only leak stack traces when running locally
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
