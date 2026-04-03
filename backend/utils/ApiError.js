/**
 * Custom API Error class.
 * Throw this in controllers to trigger the centralized error handler
 * with a specific HTTP status code and message.
 *
 * Example:
 *   throw new ApiError(404, 'Resource not found');
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    // Capture stack trace (Node.js v8+)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
