const { body, validationResult } = require('express-validator');

const validateUser = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  body('surname')
    .notEmpty()
    .withMessage('Surname is required')
    .isLength({ min: 3 })
    .withMessage('Surname must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain a letter'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  }
];

module.exports = validateUser;
