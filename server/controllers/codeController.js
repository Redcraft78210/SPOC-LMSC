/**
 * @fileoverview Contrôleur pour la gestion des codes d'accès dans l'application SPOC-LMSC.
 * Ce module fournit des fonctions pour créer, récupérer et supprimer des codes d'accès.
 */
const Code = require('../models/Code.js');

/**
 * Récupère tous les codes d'accès de la base de données.
 * 
 * @async
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>} - Une promesse qui se résout quand la réponse est envoyée.
 * @throws {Error} - Peut lever une erreur lors de l'accès à la base de données.
 * 
 * @example
 * // Route Express
 * app.get('/api/codes', getAllCodes);
 */
async function getAllCodes(req, res) {
  try {
    const codes = await Code.findAll();
    res.json(codes);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Crée un nouveau code d'accès avec les paramètres fournis.
 * 
 * @async
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.body - Les données du corps de la requête.
 * @param {string} req.body.role - Le rôle associé au code.
 * @param {string|number} req.body.classId - L'identifiant de la classe associée au code.
 * @param {number} req.body.usageLimit - Nombre maximum d'utilisations autorisées.
 * @param {number} req.body.validityPeriod - Période de validité en heures.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>} - Une promesse qui se résout quand la réponse est envoyée.
 * @throws {Error} - Peut lever une erreur lors de la création en base de données.
 * 
 * @example
 * // Exemple d'appel API
 * fetch('/api/codes', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     role: 'STUDENT',
 *     classId: '12345',
 *     usageLimit: 30,
 *     validityPeriod: 48
 *   })
 * });
 */
async function createCode(req, res) {
  const { role, classId, usageLimit, validityPeriod } = req.body;

  const newCode = new Code({
    value: generateRandomCode(),
    role,
    classId,
    usageLimit,
    remainingUses: usageLimit,
    expiresAt: new Date(Date.now() + validityPeriod * 60 * 60 * 1000)
  });

  try {
    const savedCode = await newCode.save();
    res.status(201).json(savedCode);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad request' });
  }
}

/**
 * Supprime un code d'accès identifié par sa valeur.
 * 
 * @async
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.code - La valeur du code à supprimer.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>} - Une promesse qui se résout quand la réponse est envoyée.
 * @throws {Error} - Peut lever une erreur lors de l'accès ou de la suppression en base de données.
 * 
 * @example
 * // Route Express
 * app.delete('/api/codes/:code', deleteCode);
 */
async function deleteCode(req, res) {
  try {
    const code = await Code.findOne({ where: { value: req.params.code } });
    if (!code) {
      return res.status(404).json({ message: 'Code non trouvé' });
    }

    await code.destroy();
    res.json({ message: 'Code supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Génère un code aléatoire au format alphanumérique.
 * 
 * @returns {string} Une chaîne de 8 caractères alphanumériques en majuscules.
 * 
 * @example
 * const code = generateRandomCode(); // Retourne par exemple "F3G7H2K9"
 */
function generateRandomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

module.exports = {
  getAllCodes,
  createCode,
  deleteCode
};
