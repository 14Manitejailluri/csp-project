import { body, param, query } from 'express-validator';
import { FOOD_CATEGORIES, QUANTITY_UNITS, STORAGE_CONDITIONS } from '../models/Donation.js';

export const createDonationValidator = [
  body('title')
    .optional()
    .trim(),
  body('foodName')
    .optional()
    .trim(),
  body()
    .custom((body) => {
      const name = body.title || body.foodName;
      if (!name || name.trim().length < 2) {
        throw new Error('Food Name is required and must be at least 2 characters');
      }
      return true;
    }),
  body('foodType')
    .notEmpty()
    .withMessage('Food category/type is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be a valid positive number'),
  body('quantityUnit')
    .optional()
    .trim(),
  body('donorType')
    .optional()
    .trim(),
  body('dietaryType')
    .optional()
    .trim(),
  body('preparedAt')
    .notEmpty()
    .withMessage('Prepared Date and Time is required')
    .custom((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Please provide a valid prepared date/time');
      }
      // Cannot be in the future (allowing 5 minute clock drift buffer)
      if (date.getTime() > Date.now() + 5 * 60 * 1000) {
        throw new Error('Prepared time cannot be in the future');
      }
      return true;
    }),
  body()
    .custom((body) => {
      const deadline = body.pickupDeadline || body.availableUntil;
      if (!deadline) {
        throw new Error('Available Until / Best Before date/time is required');
      }
      const untilDate = new Date(deadline);
      if (isNaN(untilDate.getTime())) {
        throw new Error('Please provide a valid Available Until date/time');
      }
      const preparedDate = new Date(body.preparedAt);
      if (!isNaN(preparedDate.getTime()) && untilDate.getTime() <= preparedDate.getTime()) {
        throw new Error('Available Until time must be after the prepared time');
      }
      return true;
    }),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('pincode')
    .optional()
    .trim(),
  body('contactNumber')
    .optional()
    .trim(),
  body('pickupInstructions')
    .optional()
    .trim(),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude between -90 and 90 is required'),
  body('longitude')
    .optional()
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
