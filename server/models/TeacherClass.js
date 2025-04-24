const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Classe = require('./Classe');

const TeacherClass = sequelize.define('TeacherClass', {
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Classe,
      key: 'id',
    },
  },
}, {
  tableName: 'teacher_classes',
  timestamps: false,
});

Teacher.belongsToMany(Classe, {
  through: TeacherClass,
  foreignKey: 'teacher_id',
  otherKey: 'class_id',
});

Classe.belongsToMany(Teacher, {
  through: TeacherClass,
  foreignKey: 'class_id',
  otherKey: 'teacher_id',
});

module.exports = TeacherClass;

