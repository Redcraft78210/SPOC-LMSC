/**
 * @fileoverview Modèle Sequelize pour la gestion des administrateurs dans la base de données.
 * Ce modèle définit la structure et les propriétés des comptes administrateurs avec
 * support de l'authentification à deux facteurs et gestion des statuts.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un administrateur de la plateforme SPOC-LMSC.
 * 
 * @class Admin
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'administrateur (clé primaire)
 * @property {string} name - Nom de l'administrateur
 * @property {string} surname - Prénom de l'administrateur
 * @property {string} username - Nom d'utilisateur unique pour la connexion
 * @property {string} email - Adresse email unique de l'administrateur
 * @property {string} statut - Statut du compte ('actif' par défaut)
 * @property {boolean} firstLogin - Indicateur de première connexion (true par défaut)
 * @property {string} password - Mot de passe haché de l'administrateur
 * @property {boolean} twoFAEnabled - Indicateur d'activation de l'authentification à deux facteurs
 * @property {string} twoFASecret - Secret pour l'authentification à deux facteurs (optionnel)
 * 
 * @example
 * // Création d'un nouvel administrateur
 * const admin = await Admin.create({
 *   name: 'Dupont',
 *   surname: 'Jean',
 *   username: 'j.dupont',
 *   email: 'jean.dupont@example.com',
 *   password: 'hashedPassword123'
 * });
 * 
 * @example
 * // Recherche d'un administrateur par email
 * const admin = await Admin.findOne({
 *   where: { email: 'jean.dupont@example.com' }
 * });
 */
const Admin = sequelize.define('Admin', {
  /**
   * Identifiant unique de l'administrateur
   * @type {DataTypes.UUID}
   */
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  
  /**
   * Nom de famille de l'administrateur
   * @type {DataTypes.STRING}
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  /**
   * Prénom de l'administrateur
   * @type {DataTypes.STRING}
   */
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  /**
   * Nom d'utilisateur pour la connexion
   * @type {DataTypes.STRING}
   */
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  /**
   * Adresse email unique de l'administrateur
   * @type {DataTypes.STRING}
   */
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  
  /**
   * Statut du compte administrateur
   * @type {DataTypes.STRING}
   * @default 'actif'
   */
  statut: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'actif',
  },
  
  /**
   * Indicateur de première connexion
   * @type {DataTypes.BOOLEAN}
   * @default true
   */
  firstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  /**
   * Mot de passe haché de l'administrateur
   * @type {DataTypes.STRING}
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  /**
   * Indicateur d'activation de l'authentification à deux facteurs
   * @type {DataTypes.BOOLEAN}
   * @default false
   */
  twoFAEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  /**
   * Secret utilisé pour l'authentification à deux facteurs
   * @type {DataTypes.STRING}
   * @optional
   */
  twoFASecret: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = Admin;

