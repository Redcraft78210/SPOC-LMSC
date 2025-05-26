const { body, validationResult } = require('express-validator');

const liveValidationRules = () => {
    return [
        body('streamTitle').isString().isLength({ min: 5 }).withMessage('Stream title must be at least 5 characters long'),
        body('streamDescription').isString().isLength({ min: 10 }).withMessage('Stream description must be at least 10 characters long'),
        body('class').isString().isLength({ min: 3 }).withMessage('Classe must be at least 3 characters long'),
        body('classSubject').isString().isLength({ min: 3 }).withMessage('Classe subject must be at least 3 characters long')
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    liveValidationRules,
    validate
};
