/**
 * @fileoverview Modèle de données définissant la relation many-to-many entre les classes et les lives.
 * Ce modèle représente la table de liaison qui permet d'associer des sessions de diffusion en direct
 * à des classes spécifiques dans le système SPOC-LMSC.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Classe = require('./Classe');
const Lives = require('./Lives');

/**
 * Modèle Sequelize représentant la table de liaison entre les classes et les lives.
 * Cette table associe les sessions de diffusion en direct aux classes qui y participent.
 * 
 * @class ClassLives
 * @memberof module:models
 * 
 * @property {string} class_id - Identifiant UUID de la classe associée
 * @property {string} live_id - Identifiant UUID du live associé
 * 
 * @example
 * // Associer un live à une classe
 * await ClassLives.create({
 *   class_id: '123e4567-e89b-12d3-a456-426614174000',
 *   live_id: '987fcdeb-51a2-43d7-8f9e-123456789abc'
 * });
 * 
 * @example
 * // Récupérer toutes les associations classe-live
 * const associations = await ClassLives.findAll({
 *   include: [
 *     { model: Classe, as: 'classe' },
 *     { model: Lives, as: 'live' }
 *   ]
 * });
 */
const ClassLives = sequelize.define('ClassLives', {
  /**
   * Identifiant UUID de la classe associée.
   * Référence la clé primaire de la table classes.
   * 
   * @type {string}
   * @required
   */
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Classe,
      key: 'id',
    },
  },
  
  /**
   * Identifiant UUID du live associé.
   * Référence la clé primaire de la table lives.
   * 
   * @type {string}
   * @required
   */
  live_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Lives,
      key: 'id',
    },
  },
}, {
  tableName: 'class_lives',
  timestamps: false,
});

module.exports = ClassLives;

