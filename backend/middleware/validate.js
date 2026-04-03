const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', JSON.stringify(errors.array(), null, 2));
    const error = new ApiError(422, 'Invalid input');
    error.details = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return next(error);
  }
  next();
};

module.exports = validate;
