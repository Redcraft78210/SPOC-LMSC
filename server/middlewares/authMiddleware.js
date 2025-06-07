/**
 * @fileoverview Middleware d'authentification qui vérifie les tokens JWT pour l'application SPOC-LMSC.
 * Ce middleware protège les routes en vérifiant la validité des tokens d'authentification.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification qui vérifie la validité des tokens JWT.
 * Extrait le token JWT de l'en-tête Authorization, le vérifie, 
 * puis ajoute les informations du token décodé à l'objet requête.
 *
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - La fonction callback pour passer au middleware suivant.
 * @returns {Object|void} Renvoie une réponse d'erreur si le token est absent ou invalide,
 *                        sinon passe au middleware suivant.
 * @throws {Error} Peut lever une erreur lors de la vérification du token.
 * 
 * @example
 * // Utilisation dans un fichier de routes
 * const authMiddleware = require('../middlewares/authMiddleware');
 * router.get('/protected-route', authMiddleware, (req, res) => {
 *   // req.user contient les informations de l'utilisateur authentifié
 *   res.json({ userId: req.user.id });
 * });
 */
const authMiddleware = (req, res, next) => {

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }
  
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = decoded; 


    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'auth/invalid-token' });
  }
};

module.exports = authMiddleware;
