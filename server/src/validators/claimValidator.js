import { body, param } from 'express-validator';

export const createClaimValidator = [
  body('donationId')
    .notEmpty()
    .withMessage('Donation ID is required')
    .isMongoId()
    .withMessage('Invalid donation ID format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const claimParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid claim ID format'),
];
