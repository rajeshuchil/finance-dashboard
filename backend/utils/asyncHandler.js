/**
 * asyncHandler utility
 * Wraps async route handlers to automatically forward errors to Express
 * error handling middleware — avoids try/catch boilerplate.
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 * Note: This project uses try/catch inline for clarity; this is provided
 * as an optional utility for future use.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
