const { body, param } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_ROLES = User.schema.path('role').enumValues;
const ALLOWED_STATUS = User.schema.path('status').enumValues;

const updateRoleValidation = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(ALLOWED_ROLES).withMessage(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`)
];

const updateStatusValidation = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(ALLOWED_STATUS).withMessage(`Status must be one of: ${ALLOWED_STATUS.join(', ')}`)
];

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status } = req.query;
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const query = {};
  if (role) {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new ApiError(400, `Invalid role filter. Allowed: ${ALLOWED_ROLES.join(', ')}`);
    }
    query.role = role;
  }
  if (status) {
    if (!ALLOWED_STATUS.includes(status)) {
      throw new ApiError(400, `Invalid status filter. Allowed: ${ALLOWED_STATUS.join(', ')}`);
    }
    query.status = status;
  }

  const skip = (parsedPage - 1) * parsedLimit;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
    User.countDocuments(query)
  ]);

  res.json({
    data: users,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ data: user });
});

const updateRole = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(404, 'User not found');

  res.json({ data: user });
});

const updateStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot change your own status');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(404, 'User not found');

  res.json({ data: user });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateRole,
  updateStatus,
  updateRoleValidation,
  updateStatusValidation
};
