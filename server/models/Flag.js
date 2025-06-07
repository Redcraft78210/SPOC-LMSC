/**
 * @fileoverview Modèle Sequelize pour la gestion des signalements dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les signalements de contenu inapproprié
 * sur les threads et commentaires, incluant le suivi du statut et de la résolution.
 */

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Sequelize représentant un signalement de contenu dans le système de modération.
 * Les signalements permettent aux utilisateurs de reporter du contenu inapproprié
 * et aux modérateurs de suivre le traitement de ces signalements.
 * 
 * @class Flag
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID du signalement (clé primaire, généré automatiquement)
 * @property {string} itemId - UUID de l'élément signalé (thread ou commentaire, obligatoire)
 * @property {('thread'|'comment')} itemType - Type d'élément signalé (obligatoire)
 * @property {string} reason - Raison détaillée du signalement (obligatoire)
 * @property {string} reportedBy - UUID de l'utilisateur ayant effectué le signalement (obligatoire)
 * @property {('pending'|'reviewed'|'resolved')} status - Statut du signalement (par défaut: 'pending')
 * @property {string|null} resolvedBy - UUID de l'utilisateur ayant résolu le signalement (optionnel, référence vers la table users)
 * @property {Date|null} resolvedAt - Date et heure de résolution du signalement (optionnel)
 * @property {Date} createdAt - Date et heure de création du signalement (automatique)
 * @property {Date} updatedAt - Date et heure de dernière modification (automatique)
 * 
 * @example
 * // Création d'un nouveau signalement
 * const nouveauSignalement = await Flag.create({
 *   itemId: '550e8400-e29b-41d4-a716-446655440000',
 *   itemType: 'comment',
 *   reason: 'Contenu offensant et inapproprié',
 *   reportedBy: '660e8400-e29b-41d4-a716-446655440001'
 * });
 * 
 * @example
 * // Résolution d'un signalement
 * await signalement.update({
 *   status: 'resolved',
 *   resolvedBy: '770e8400-e29b-41d4-a716-446655440002',
 *   resolvedAt: new Date()
 * });
 * 
 * @example
 * // Recherche des signalements en attente
 * const signalementsEnAttente = await Flag.findAll({
 *   where: { status: 'pending' },
 *   order: [['createdAt', 'ASC']]
 * });
 */
const Flag = sequelize.define('Flag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  itemType: {
    type: DataTypes.ENUM('thread', 'comment'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
    defaultValue: 'pending'
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Flag;