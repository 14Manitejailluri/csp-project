import { body, param, query } from 'express-validator';
import { FOOD_CATEGORIES, QUANTITY_UNITS, STORAGE_CONDITIONS } from '../models/Donation.js';

export const createDonationValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Food title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('foodType')
    .notEmpty()
    .withMessage('Food type category is required')
    .isIn(FOOD_CATEGORIES)
    .withMessage(`Food type must be one of: ${FOOD_CATEGORIES.join(', ')}`),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be greater than 0'),
  body('quantityUnit')
    .optional()
    .isIn(QUANTITY_UNITS)
    .withMessage(`Quantity unit must be one of: ${QUANTITY_UNITS.join(', ')}`),
  body('preparedAt')
    .notEmpty()
    .withMessage('Preparation date/time is required')
    .isISO8601()
    .withMessage('Prepared date must be a valid ISO8601 date string'),
  body('pickupDeadline')
    .notEmpty()
    .withMessage('Pickup deadline is required')
    .isISO8601()
    .withMessage('Pickup deadline must be a valid ISO8601 date string')
    .custom((deadline, { req }) => {
      const pickupDate = new Date(deadline);
      if (pickupDate <= new Date()) {
        throw new Error('Pickup deadline must be in the future');
      }
      return true;
    }),
  body('storageCondition')
    .optional()
    .isIn(STORAGE_CONDITIONS)
    .withMessage(`Storage condition must be one of: ${STORAGE_CONDITIONS.join(', ')}`),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude between -90 and 90 is required'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude between -180 and 180 is required'),
];

export const updateDonationValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid donation ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }),
  body('foodType')
    .optional()
    .isIn(FOOD_CATEGORIES),
  body('quantity')
    .optional()
    .isFloat({ min: 0.1 }),
  body('quantityUnit')
    .optional()
    .isIn(QUANTITY_UNITS),
  body('storageCondition')
    .optional()
    .isIn(STORAGE_CONDITIONS),
];

export const nearbyDonationsValidator = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radiusKm')
    .optional()
    .isFloat({ min: 0.1, max: 500 })
    .withMessage('Radius must be between 0.1 and 500 km'),
];
