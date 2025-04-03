const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');

// Define associations
Course.belongsToMany(User, { through: 'Enrollments' });
User.belongsToMany(Course, { through: 'Enrollments' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Course,
};
