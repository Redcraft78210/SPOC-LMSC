/**
 * @fileoverview Middleware pour la validation des données utilisateur lors de l'inscription ou la mise à jour.
 * Ce module utilise express-validator pour vérifier que les données soumises respectent les critères définis.
 * @module middlewares/userValidation
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware de validation des données utilisateur.
 * Vérifie que les champs nom, prénom, email et mot de passe respectent les critères de validation.
 * 
 * @type {Array<import('express').RequestHandler>}
 * @example
 * // Dans un fichier de routes:
 * const validateUser = require('../middlewares/userValidation');
 * 
 * router.post('/register', validateUser, userController.register);
 */
const validateUser = [
  /**
   * Validation du champ 'name'
   * @param {string} name - Le prénom de l'utilisateur
   */
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  
  /**
   * Validation du champ 'surname'
   * @param {string} surname - Le nom de famille de l'utilisateur
   */
  body('surname')
    .notEmpty()
    .withMessage('Surname is required')
    .isLength({ min: 3 })
    .withMessage('Surname must be at least 3 characters long'),
  
  /**
   * Validation du champ 'email'
   * @param {string} email - L'adresse email de l'utilisateur
   */
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  /**
   * Validation du champ 'password'
   * @param {string} password - Le mot de passe de l'utilisateur
   */
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain a letter'),

  /**
   * Gestionnaire de validation qui vérifie les résultats et renvoie les erreurs
   * ou passe au middleware suivant.
   * 
   * @param {import('express').Request} req - L'objet requête Express
   * @param {import('express').Response} res - L'objet réponse Express
   * @param {import('express').NextFunction} next - La fonction pour passer au middleware suivant
   * @returns {void}
   * @throws {Object} Renvoie un objet d'erreurs avec statut 400 si la validation échoue
   */
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  }
];

module.exports = validateUser;
