const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');

const ROLES = Object.freeze({
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
});

/**
 * Protects routes by enforcing valid JWT authentication.
 * Attaches the authenticated user document to the `req` object on success.
 */
const authenticateRequest = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token is required');
    }

    const decoded = verifyToken(token);
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(401, 'User not found for this token');
    }

    if (user.status === 'inactive') {
      throw new ApiError(403, 'Account is inactive');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-based access control (RBAC) middleware.
 * Must be used after `authenticateRequest` so `req.user` is available.
 */
const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }

    next();
  };
};

const requireAdmin = requireRoles(ROLES.ADMIN);
const requireAnalystOrAdmin = requireRoles(ROLES.ANALYST, ROLES.ADMIN);
const requireViewerOrAbove = requireRoles(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN);

module.exports = {
  authenticateRequest,
  requireRoles,
  requireAdmin,
  requireAnalystOrAdmin,
  requireViewerOrAbove,
  ROLES
};
