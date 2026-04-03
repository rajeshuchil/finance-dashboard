const { body, param } = require('express-validator');
const Record = require('../models/Record');

const createRecordValidation = [
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['income', 'expense']),
  body('category').trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('notes').optional().trim()
];

const updateRecordValidation = [
  param('id').isMongoId(),
  body('amount').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(['income', 'expense']),
  body('category').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('notes').optional().trim()
];

const createRecord = async (req, res, next) => {
  try {
    const record = await Record.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves records with support for highly dynamic filtering, free-text search, and pagination.
 */
const getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const query = {};
    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');
    
    // Support filtering by inclusive date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Perform loose text matching across categories and notes
    if (search) {
      query.$or = [
        { category: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Run count operation concurrently with the paginated fetch for performance
    const [records, total] = await Promise.all([
      Record.find(query).populate('createdBy', 'name email').sort(sort).skip(skip).limit(parseInt(limit)),
      Record.countDocuments(query)
    ]);

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      records
    });
  } catch (err) {
    next(err);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id).populate('createdBy', 'name email');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    // We implement a soft delete rather than a hard DB removal.
    // This allows recovery, maintains audit trails, and keeps foreign key dependencies intact.
    const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  createRecordValidation,
  updateRecordValidation
};
