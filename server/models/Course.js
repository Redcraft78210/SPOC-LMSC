const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {  
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true  
  },
  
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',  
      key: 'id'
    }
  },
  matiere: {
    type: DataTypes.STRING,
    allowNull: true  
  },
  chapitre: {
    type: DataTypes.STRING,
    allowNull: true  
  }
}, {
  tableName: 'courses',
  
  timestamps: true
});

module.exports = Course;