const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    defaultValue: 'student',
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
