const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseDocument = sequelize.define('CourseDocument', {
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'documents',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'course_documents',
  timestamps: false
});

module.exports = CourseDocument;