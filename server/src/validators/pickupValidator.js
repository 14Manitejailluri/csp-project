import { body, param } from 'express-validator';

export const assignPickupValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid pickup ID format'),
  body('volunteerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid volunteer ID format'),
  body('scheduledTime')
    .optional()
    .isISO8601()
    .withMessage('Scheduled time must be a valid ISO8601 date'),
];

export const updatePickupStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid pickup ID format'),
  body('notes')
    .optional()
    .trim(),
];
