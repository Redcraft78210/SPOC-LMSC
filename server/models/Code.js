/**
 * @fileoverview
 * Modèle Sequelize pour la gestion des codes d'invitation dans l'application SPOC-LMSC.
 * Ce module définit la structure de données et les contraintes pour les codes d'accès
 * permettant aux utilisateurs de s'inscrire sur la plateforme avec des rôles et limites spécifiques.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un code d'invitation dans le système.
 * Les codes d'invitation permettent de contrôler l'accès à la plateforme en définissant
 * des permissions spécifiques par rôle, des limites d'usage et des dates d'expiration.
 * 
 * @class Code
 * @extends {Sequelize.Model}
 * 
 * @property {string} value - Valeur unique du code d'invitation (obligatoire)
 * @property {string} role - Rôle associé au code (Etudiant, Enseignant, Administrateur) (obligatoire)
 * @property {string|null} classId - UUID de la classe associée au code (optionnel)
 * @property {number} usageLimit - Nombre maximum d'utilisations autorisées (obligatoire)
 * @property {number} remainingUses - Nombre d'utilisations restantes (obligatoire)
 * @property {Date} expiresAt - Date et heure d'expiration du code (obligatoire)
 * 
 * @example
 * // Création d'un nouveau code d'invitation
 * const nouveauCode = await Code.create({
 *   value: 'ABC123DEF',
 *   role: 'Etudiant',
 *   classId: '550e8400-e29b-41d4-a716-446655440000',
 *   usageLimit: 50,
 *   remainingUses: 50,
 *   expiresAt: new Date('2024-12-31T23:59:59Z')
 * });
 * 
 * @example
 * // Recherche d'un code par sa valeur
 * const code = await Code.findOne({
 *   where: { value: 'ABC123DEF' }
 * });
 * 
 * @example
 * // Mise à jour du nombre d'utilisations restantes
 * await code.update({
 *   remainingUses: code.remainingUses - 1
 * });
 */
const Code = sequelize.define('Code', {
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remainingUses: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'codes',
  timestamps: false,
});

module.exports = Code;
