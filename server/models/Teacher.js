/**
 * @fileoverview Modèle Sequelize pour la gestion des enseignants dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les enseignants, incluant leurs informations
 * personnelles, d'authentification et de statut, avec support de l'authentification à deux facteurs.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un enseignant dans le système éducatif.
 * Les enseignants peuvent créer et gérer du contenu pédagogique, être assignés
 * comme enseignant principal d'une classe et disposent d'un système d'authentification
 * avec support de l'authentification à deux facteurs.
 * 
 * @class Teacher
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'enseignant (clé primaire, généré automatiquement)
 * @property {string} name - Prénom de l'enseignant (obligatoire)
 * @property {string} surname - Nom de famille de l'enseignant (obligatoire)
 * @property {string} username - Nom d'utilisateur unique pour la connexion (obligatoire)
 * @property {string} email - Adresse email unique de l'enseignant (obligatoire)
 * @property {string} statut - Statut actuel de l'enseignant (par défaut: 'actif')
 * @property {boolean} firstLogin - Indique si c'est la première connexion (par défaut: true)
 * @property {string} password - Mot de passe haché de l'enseignant (obligatoire)
 * @property {boolean} twoFAEnabled - Indique si l'authentification à deux facteurs est activée (par défaut: false)
 * @property {string|null} twoFASecret - Clé secrète pour l'authentification à deux facteurs (optionnel)
 * @property {Date} createdAt - Date et heure de création du compte (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un nouvel enseignant
 * const nouvelEnseignant = await Teacher.create({
 *   name: 'Jean',
 *   surname: 'Dupont',
 *   username: 'jdupont',
 *   email: 'jean.dupont@exemple.com',
 *   password: 'motDePasseHache',
 *   statut: 'actif'
 * });
 * 
 * @example
 * // Recherche d'un enseignant par email
 * const enseignant = await Teacher.findOne({
 *   where: { email: 'jean.dupont@exemple.com' }
 * });
 * 
 * @example
 * // Activation de l'authentification à deux facteurs
 * await enseignant.update({
 *   twoFAEnabled: true,
 *   twoFASecret: 'secretKey123'
 * });
 */
const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'actif',
  },
  firstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "twoFAEnabled": {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  "twoFASecret": {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = Teacher;

