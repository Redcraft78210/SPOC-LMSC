const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const StudentClass = require('./StudentClass');
const Classe = require('./Classe');
const Lives = require('./Lives');
const Teacher = require('./Teacher');
const ClassLives = require('./ClassLives');
const Course = require('./Course');
const Admin = require('./Admin');
const Code = require('./Code');


// Define associations
Course.belongsToMany(Student, { through: 'Enrollments' });
Student.belongsToMany(Course, { through: 'Enrollments' });

Student.belongsToMany(Classe, {
  through: 'StudentClass',
  foreignKey: 'student_id',
  otherKey: 'class_id'
});

Classe.belongsToMany(Student, {
  through: 'StudentClass',
  foreignKey: 'class_id',
  otherKey: 'student_id'
});

Classe.belongsToMany(Lives, {
  through: ClassLives,
  foreignKey: 'class_id',
  otherKey: 'live_id',
});

Lives.belongsToMany(Classe, {
  through: ClassLives,
  foreignKey: 'live_id',
  otherKey: 'class_id',
});

// Direct association without a cross table
Teacher.hasMany(Lives, { foreignKey: 'teacher_id' });
Lives.belongsTo(Teacher, { foreignKey: 'teacher_id' });

// Export models and sequelize instance
module.exports = {
  User,
  Admin,
  Student,
  StudentClass,
  Classe,
  Lives,
  Teacher,
  ClassLives,
  Course,
  Code
};
