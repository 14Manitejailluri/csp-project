import { body, param } from 'express-validator';

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }),
  body('phone')
    .optional()
    .trim(),
  body('organizationName')
    .optional()
    .trim(),
];

export const userParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];
