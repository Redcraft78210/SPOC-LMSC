const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// Define the Course model
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  instructor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define associations
Course.belongsToMany(User, { through: 'Enrollments' });
User.belongsToMany(Course, { through: 'Enrollments' });

module.exports = Course;
