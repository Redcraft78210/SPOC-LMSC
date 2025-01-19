const { body, validationResult } = require('express-validator');

const validateCourse = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('instructor')
    .notEmpty()
    .withMessage('Instructor is required')
    .isLength({ min: 3 })
    .withMessage('Instructor name must be at least 3 characters long'),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  }
];

module.exports = validateCourse;
