import { body, param, query, validationResult } from 'express-validator';
import logger from '../lib/logger.js';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors,
];

export const validateUserLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Property validation rules
export const validateProperty = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('bedrooms')
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),
  body('bathrooms')
    .isInt({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),
  body('area')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number'),
  body('address')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('zipCode')
    .isPostalCode('US')
    .withMessage('Please provide a valid ZIP code'),
  body('propertyType')
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'])
    .withMessage('Invalid property type'),
  body('listingType')
    .isIn(['sale', 'rent'])
    .withMessage('Invalid listing type'),
  handleValidationErrors,
];

// Search validation rules
export const validateSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minPrice')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('propertyType')
    .optional()
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'])
    .withMessage('Invalid property type'),
  query('listingType')
    .optional()
    .isIn(['sale', 'rent'])
    .withMessage('Invalid listing type'),
  handleValidationErrors,
];

// ID parameter validation
export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];
