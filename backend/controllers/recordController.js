const { body, param, query } = require('express-validator');
const Record = require('../models/Record');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_TYPES = ['income', 'expense'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const parseSort = (query) => {
  const sortOrder = ALLOWED_SORT_ORDERS.includes(query.sortOrder) ? query.sortOrder : 'desc';
  return { date: sortOrder === 'asc' ? 1 : -1 };
};

const buildRecordFilters = ({ type, category, startDate, endDate }) => {
  const filters = {};

  if (type) {
    filters.type = type;
  }

  if (category) {
    filters.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
  }

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) {
      filters.date.$gte = new Date(startDate);
    }
    if (endDate) {
      filters.date.$lte = new Date(endDate);
    }
  }

  return filters;
};

const sendData = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

const ensureRecordExists = (record) => {
  if (!record) {
    throw new ApiError(404, 'Record not found');
  }
  return record;
};

const recordIdValidation = [
  param('id').isMongoId().withMessage('Invalid record id')
];

const createRecordValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(ALLOWED_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters')
];

const updateRecordValidation = [
  ...recordIdValidation,
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .optional()
    .isIn(ALLOWED_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters')
];

const getRecordsValidation = [
  query('type')
    .optional()
    .isIn(ALLOWED_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`),
  query('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category filter must be between 2 and 100 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO8601 date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortOrder')
    .optional()
    .isIn(ALLOWED_SORT_ORDERS)
    .withMessage(`sortOrder must be one of: ${ALLOWED_SORT_ORDERS.join(', ')}`)
];

const createRecord = asyncHandler(async (req, res) => {
  const record = await Record.create({
    ...req.body,
    createdBy: req.user.id
  });

  return sendData(res, record, 201);
});

const getRecords = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate } = req.query;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, 'startDate cannot be greater than endDate');
  }

  const filters = buildRecordFilters({ type, category, startDate, endDate });
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);

  const [records, total] = await Promise.all([
    Record.find(filters).populate('createdBy', 'name email').sort(sort).skip(skip).limit(limit),
    Record.countDocuments(filters)
  ]);

  return sendData(res, {
    records,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id).populate('createdBy', 'name email');
  return sendData(res, ensureRecordExists(record));
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendData(res, ensureRecordExists(record));
});

const deleteRecord = asyncHandler(async (req, res) => {
  const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
  ensureRecordExists(record);

  return res.json({
    message: 'Record deleted successfully',
    data: { id: record._id }
  });
});

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  recordIdValidation,
  createRecordValidation,
  updateRecordValidation,
  getRecordsValidation
};
