const { body } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const authResponse = (user) => {
  return {
    token: generateToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  };
};

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage('Password must be at least 8 chars and include upper, lower, number, and symbol'),
  body('role')
    .not()
    .exists()
    .withMessage('Role cannot be set during registration')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  const user = await User.create({ name, email, password, role: 'viewer' });

  res.status(201).json(authResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Account is inactive');
  }

  res.json(authResponse(user));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(user);
});

module.exports = { register, login, getMe, registerValidation, loginValidation };
