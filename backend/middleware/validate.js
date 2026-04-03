const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ApiError(422, 'Validation failed');
    error.details = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return next(error);
  }
  next();
};

module.exports = validate;
