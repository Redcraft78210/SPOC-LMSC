/**
 * @fileoverview Modèle Sequelize pour la gestion des avertissements dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les avertissements émis par les administrateurs
 * vers les utilisateurs, incluant le suivi de leur lecture.
 */

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Sequelize représentant un avertissement dans le système.
 * Les avertissements permettent aux administrateurs de notifier les utilisateurs
 * de problèmes ou de violations des règles d'utilisation.
 * 
 * @class Warning
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'avertissement (clé primaire, généré automatiquement)
 * @property {string} userId - UUID de l'utilisateur destinataire de l'avertissement (obligatoire, référence vers la table users)
 * @property {string} adminId - UUID de l'administrateur émetteur de l'avertissement (obligatoire, référence vers la table users)
 * @property {string} message - Contenu textuel de l'avertissement (obligatoire)
 * @property {boolean} read - Statut de lecture de l'avertissement (par défaut: false)
 * @property {Date} createdAt - Date et heure de création de l'avertissement (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un nouvel avertissement
 * const nouvelAvertissement = await Warning.create({
 *   userId: '550e8400-e29b-41d4-a716-446655440000',
 *   adminId: '660e8400-e29b-41d4-a716-446655440001',
 *   message: 'Veuillez respecter les règles de conduite dans les forums de discussion.',
 *   read: false
 * });
 * 
 * @example
 * // Recherche des avertissements non lus d'un utilisateur
 * const avertissementsNonLus = await Warning.findAll({
 *   where: { 
 *     userId: '550e8400-e29b-41d4-a716-446655440000',
 *     read: false 
 *   },
 *   order: [['createdAt', 'DESC']]
 * });
 * 
 * @example
 * // Marquer un avertissement comme lu
 * await Warning.update(
 *   { read: true },
 *   { where: { id: '770e8400-e29b-41d4-a716-446655440002' } }
 * );
 */
const Warning = sequelize.define('Warning', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Warning;