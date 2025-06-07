/**
 * @fileoverview Modèle Sequelize pour la gestion des utilisateurs dans l'application SPOC-LMSC.
 * Ce module définit la structure de données pour les utilisateurs du système éducatif,
 * incluant l'authentification, les rôles et les paramètres de sécurité.
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Sequelize représentant un utilisateur dans le système SPOC-LMSC.
 * Les utilisateurs peuvent avoir différents rôles (Étudiant, Professeur, Administrateur)
 * et bénéficient de fonctionnalités d'authentification à deux facteurs.
 * 
 * @class User
 * @extends {Sequelize.Model}
 * 
 * @property {string} id - Identifiant unique UUID de l'utilisateur (clé primaire, généré automatiquement)
 * @property {string} email - Adresse email unique de l'utilisateur (obligatoire, unique)
 * @property {string|null} username - Nom d'utilisateur unique (optionnel, unique si défini)
 * @property {string} password - Mot de passe crypté de l'utilisateur (obligatoire)
 * @property {string} name - Prénom de l'utilisateur (obligatoire)
 * @property {string} surname - Nom de famille de l'utilisateur (obligatoire)
 * @property {string} statut - Statut du compte utilisateur (par défaut: 'actif')
 * @property {boolean} firstLogin - Indique si c'est la première connexion de l'utilisateur (par défaut: true)
 * @property {boolean} twoFAEnabled - Indique si l'authentification à deux facteurs est activée (par défaut: false)
 * @property {string|null} twoFASecret - Clé secrète pour l'authentification à deux facteurs (optionnel)
 * @property {('Etudiant'|'Professeur'|'Administrateur')} role - Rôle de l'utilisateur dans le système (par défaut: 'Etudiant')
 * @property {Date} createdAt - Date et heure de création du compte (généré automatiquement)
 * @property {Date} updatedAt - Date et heure de dernière modification (généré automatiquement)
 * 
 * @example
 * // Création d'un nouvel utilisateur étudiant
 * const nouvelEtudiant = await User.create({
 *   email: 'etudiant@example.com',
 *   username: 'etudiant123',
 *   password: 'motDePasseCrypte',
 *   name: 'Jean',
 *   surname: 'Dupont',
 *   role: 'Etudiant'
 * });
 * 
 * @example
 * // Recherche d'un utilisateur par email
 * const utilisateur = await User.findOne({
 *   where: { email: 'prof@example.com' }
 * });
 * 
 * @example
 * // Activation de l'authentification à deux facteurs
 * await utilisateur.update({
 *   twoFAEnabled: true,
 *   twoFASecret: 'JBSWY3DPEHPK3PXP'
 * });
 * 
 * @example
 * // Recherche de tous les professeurs actifs
 * const professeurs = await User.findAll({
 *   where: { 
 *     role: 'Professeur',
 *     statut: 'actif'
 *   }
 * });
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
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
  twoFAEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  twoFASecret: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('Etudiant', 'Professeur', 'Administrateur'),
    defaultValue: 'Etudiant',
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
