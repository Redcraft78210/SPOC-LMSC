/**
 * @fileoverview Modèle Sequelize pour la gestion des avatars utilisateur dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les images d'avatar compressées stockées en base,
 * incluant les métadonnées comme la taille, la qualité de compression et les dimensions.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un avatar utilisateur dans le système.
 * Les avatars sont stockés sous forme de données binaires compressées avec leurs métadonnées.
 * 
 * @class UserAvatar
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'avatar (clé primaire, généré automatiquement)
 * @property {string} user_id - UUID de l'utilisateur propriétaire (référence vers la table users, unique)
 * @property {string} mime_type - Type MIME du fichier image (obligatoire, max 128 caractères)
 * @property {string|null} file_name - Nom original du fichier (optionnel, max 255 caractères)
 * @property {number} original_size - Taille originale du fichier en octets (obligatoire)
 * @property {number} compressed_size - Taille après compression en octets (obligatoire)
 * @property {Buffer} data - Données binaires de l'image compressée (obligatoire, LONGBLOB)
 * @property {number} compression_quality - Qualité de compression en pourcentage (50-100, obligatoire)
 * @property {string} dimensions - Dimensions de l'image au format "largeur x hauteur" (obligatoire, max 20 caractères)
 * @property {Date} createdAt - Date et heure de création de l'avatar (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un nouvel avatar utilisateur
 * const nouvelAvatar = await UserAvatar.create({
 *   user_id: '550e8400-e29b-41d4-a716-446655440000',
 *   mime_type: 'image/jpeg',
 *   file_name: 'avatar.jpg',
 *   original_size: 2048000,
 *   compressed_size: 256000,
 *   data: Buffer.from('...'),
 *   compression_quality: 80,
 *   dimensions: '300x300'
 * });
 * 
 * @example
 * // Recherche de l'avatar d'un utilisateur spécifique
 * const avatar = await UserAvatar.findOne({
 *   where: { user_id: '550e8400-e29b-41d4-a716-446655440000' }
 * });
 * 
 * @example
 * // Mise à jour de l'avatar d'un utilisateur
 * await UserAvatar.update({
 *   data: newImageBuffer,
 *   compressed_size: newSize,
 *   compression_quality: 90
 * }, {
 *   where: { user_id: userId }
 * });
 */
const UserAvatar = sequelize.define('UserAvatar', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    unique: true
  },
  mime_type: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  original_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  compressed_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  },
  compression_quality: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      min: 50,
      max: 100
    }
  },
  dimensions: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'user_avatars',
  timestamps: true
});

module.exports = UserAvatar;