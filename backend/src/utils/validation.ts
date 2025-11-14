import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const createProblemValidation: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('inputFormat')
    .trim()
    .notEmpty()
    .withMessage('Input format is required'),
  
  body('outputFormat')
    .trim()
    .notEmpty()
    .withMessage('Output format is required'),
  
  body('constraints')
    .trim()
    .notEmpty()
    .withMessage('Constraints are required'),
  
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  
  body('topics')
    .isArray({ min: 1 })
    .withMessage('At least one topic is required'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 100, max: 10000 })
    .withMessage('Time limit must be between 100 and 10000 milliseconds'),
  
  body('memoryLimit')
    .optional()
    .isInt({ min: 16, max: 1024 })
    .withMessage('Memory limit must be between 16 and 1024 MB'),
];

export const updateProblemValidation: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('inputFormat')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Input format cannot be empty'),
  
  body('outputFormat')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Output format cannot be empty'),
  
  body('constraints')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Constraints cannot be empty'),
  
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  
  body('topics')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one topic is required'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 100, max: 10000 })
    .withMessage('Time limit must be between 100 and 10000 milliseconds'),
  
  body('memoryLimit')
    .optional()
    .isInt({ min: 16, max: 1024 })
    .withMessage('Memory limit must be between 16 and 1024 MB'),
];

export const uploadTestCasesValidation: ValidationChain[] = [
  body('testCases')
    .isArray({ min: 1 })
    .withMessage('At least one test case is required'),
  
  body('testCases.*.input')
    .notEmpty()
    .withMessage('Test case input is required'),
  
  body('testCases.*.expectedOutput')
    .notEmpty()
    .withMessage('Test case expected output is required'),
  
  body('testCases.*.isPublic')
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('testCases.*.points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  
  body('testCases.*.orderIndex')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order index must be a positive integer'),
];
