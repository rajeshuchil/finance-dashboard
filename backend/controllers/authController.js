const { body } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const authResponse = (user) => ({
  token: generateToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  }
});

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Prevent clients from self-assigning a role at registration
  body('role')
    .not().exists()
    .withMessage('Role cannot be set during registration')
];

const loginValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const register = asyncHandler(async (req, res) => {
  console.log('Register Request Body:', req.body);
  const { name, email, password } = req.body;

  // Role defaults to 'viewer' in the model — not set here intentionally
  const user = await User.create({ name, email, password });

  res.status(201).json({ message: 'User registered successfully', data: authResponse(user) });
});

const login = asyncHandler(async (req, res) => {
  console.log('Login Request Body:', req.body);
  const { email, password } = req.body;

  // Explicitly select password since it's excluded from queries by default
  const user = await User.findOne({ email }).select('+password');
  console.log('User Lookup:', user ? `Found user: ${user.email}` : 'Not found');

  if (!user || !(await user.comparePassword(password))) {
    // Only return 401 if user not found or password incorrect
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Account is inactive');
  }

  res.json({ message: 'Login successful', data: authResponse(user) });
});

// req.user is attached by authenticateRequest middleware — no extra DB call needed
const getMe = asyncHandler(async (req, res) => {
  res.json({ data: req.user });
});

module.exports = { register, login, getMe, registerValidation, loginValidation };
