const sequelize = require('../config/database');
const Student = require('./Student');
const StudentClass = require('./StudentClass');
const Class = require('./Class');
const Lives = require('./Lives');
const Teacher = require('./Teacher');
const ClassLives = require('./ClassLives');
const Course = require('./Course');


// Define associations
Course.belongsToMany(Student, { through: 'Enrollments' });
Student.belongsToMany(Course, { through: 'Enrollments' });

Student.belongsToMany(Class, {
  through: 'StudentClass',
  foreignKey: 'student_id',
  otherKey: 'class_id'
});

Class.belongsToMany(Student, {
  through: 'StudentClass',
  foreignKey: 'class_id',
  otherKey: 'student_id'
});

Class.belongsToMany(Lives, {
  through: ClassLives,
  foreignKey: 'class_id',
  otherKey: 'live_id',
});

Lives.belongsToMany(Class, {
  through: ClassLives,
  foreignKey: 'live_id',
  otherKey: 'class_id',
});

// Direct association without a cross table
Teacher.hasMany(Lives, { foreignKey: 'teacher_id' });
Lives.belongsTo(Teacher, { foreignKey: 'teacher_id' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  Student,
  StudentClass,
  Class,
  Lives,
  Teacher,
  ClassLives,
  Course
};
