const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define(
  'Student',
  {
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
  },
  {
    tableName: 'students',
    timestamps: true,
  },
);

module.exports = Student;

