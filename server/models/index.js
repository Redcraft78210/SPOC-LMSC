const sequelize = require('../config/database');

const User = require('./User');
const CourseProgress = require('./CourseProgress');
const LiveAttendance = require('./LiveAttendance');
const Student = require('./Student');
const StudentClass = require('./StudentClass');
const Classe = require('./Classe');
const Lives = require('./Lives');
const Teacher = require('./Teacher');
const ClassLives = require('./ClassLives');
const Course = require('./Course');
const Admin = require('./Admin');
const Code = require('./Code');
const Comment = require('./Comment');
const Thread = require('./Thread');
const ChatMessage = require('./ChatMessage');
const UserAvatar = require('./UserAvatar');
const Document = require('./Document');  // Add Document import
const Video = require('./Video');  // Add Video import

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

Lives.hasMany(ChatMessage, { foreignKey: 'live_id' });
ChatMessage.belongsTo(Lives, { foreignKey: 'live_id' });

User.hasMany(ChatMessage, { foreignKey: 'user_id' });
ChatMessage.belongsTo(User, { foreignKey: 'user_id' });

Teacher.hasMany(Lives, { foreignKey: 'teacher_id' });
Lives.belongsTo(Teacher, { foreignKey: 'teacher_id' });

User.hasMany(Thread, { foreignKey: 'authorId' });
Thread.belongsTo(User, { foreignKey: 'authorId' });

User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

Thread.hasMany(Comment, { foreignKey: 'threadId' });
Comment.belongsTo(Thread, { foreignKey: 'threadId' });

// Add CourseProgress associations
CourseProgress.belongsTo(Student, { foreignKey: 'user_id' });
Student.hasMany(CourseProgress, { foreignKey: 'user_id' });

CourseProgress.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(CourseProgress, { foreignKey: 'course_id' });

// Add LiveAttendance associations
LiveAttendance.belongsTo(Student, { foreignKey: 'user_id' });
Student.hasMany(LiveAttendance, { foreignKey: 'user_id' });

LiveAttendance.belongsTo(Lives, { foreignKey: 'live_id' });
Lives.hasMany(LiveAttendance, { foreignKey: 'live_id' });

// Add Document associations
Document.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Document, { foreignKey: 'course_id' });

// Add Video associations with Course (assuming a course can have many videos)
Video.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Video, { foreignKey: 'course_id' });

// Association User-Avatar (One-to-One)
User.hasOne(UserAvatar, { foreignKey: 'user_id', as: 'avatar' });
UserAvatar.belongsTo(User, { foreignKey: 'user_id' });

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
  Code,
  Comment,
  Thread,
  ChatMessage,
  CourseProgress,
  LiveAttendance,
  UserAvatar,
  Document,  // Add Document to exports
  Video,     // Add Video to exports
  sequelize,
};
