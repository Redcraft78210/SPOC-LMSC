const User = require('../models/User');
const Course = require('../models/Course');

const enrollUser = async (userId, courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error('Course not found');

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  await course.addUser(user);
  return { message: 'User enrolled successfully' };
};

module.exports = { enrollUser };
