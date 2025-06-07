/**
 * @fileoverview Modèle Sequelize pour la gestion des commentaires dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les commentaires associés aux threads de discussion,
 * incluant l'auteur, le contenu et les horodatages.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un commentaire dans le système de discussion.
 * Les commentaires sont associés à des threads et ont un auteur identifié.
 * 
 * @class Comment
 * @extends {Sequelize.Model}
 * 
 * @property {string} content - Contenu textuel du commentaire (obligatoire)
 * @property {string} authorId - UUID de l'auteur du commentaire (obligatoire, référence vers la table users)
 * @property {string} threadId - UUID du thread auquel appartient ce commentaire (obligatoire, référence vers la table threads)
 * @property {Date} createdAt - Date et heure de création du commentaire (par défaut: maintenant)
 * 
 * @example
 * // Création d'un nouveau commentaire
 * const nouveauCommentaire = await Comment.create({
 *   content: 'Ceci est un commentaire très utile',
 *   authorId: '550e8400-e29b-41d4-a716-446655440000',
 *   threadId: '660e8400-e29b-41d4-a716-446655440001'
 * });
 * 
 * @example
 * // Recherche de tous les commentaires d'un thread
 * const commentaires = await Comment.findAll({
 *   where: { threadId: '660e8400-e29b-41d4-a716-446655440001' },
 *   order: [['createdAt', 'ASC']]
 * });
 * 
 * @example
 * // Recherche des commentaires d'un auteur spécifique
 * const commentairesAuteur = await Comment.findAll({
 *   where: { authorId: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 */
const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  threadId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'comments',
  timestamps: false,
});

module.exports = Comment;

