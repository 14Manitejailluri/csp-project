import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    const firstMsg = extractedErrors[0]?.message || 'Please check the entered information.';
    return res.status(422).json({
      success: false,
      message: firstMsg,
      errors: extractedErrors,
    });
  }
  next();
};
