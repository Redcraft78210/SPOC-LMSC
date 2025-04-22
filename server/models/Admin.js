const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  tableName: 'administrateurs',
  timestamps: true,
});

module.exports = Admin;

