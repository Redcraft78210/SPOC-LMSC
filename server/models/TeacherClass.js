const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Teacher = require('./Teacher');
const Class = require('./Class');

const TeacherClass = sequelize.define('TeacherClass', {
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'id',
    },
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Class,
      key: 'id',
    },
  },
}, {
  tableName: 'teacher_classes',
  timestamps: false,
});

Teacher.belongsToMany(Class, {
  through: TeacherClass,
  foreignKey: 'teacher_id',
  otherKey: 'class_id',
});

Class.belongsToMany(Teacher, {
  through: TeacherClass,
  foreignKey: 'class_id',
  otherKey: 'teacher_id',
});

module.exports = TeacherClass;

