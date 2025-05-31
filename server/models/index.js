const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
sequelize.Op = Sequelize.Op;

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
const Document = require('./Document');
const Video = require('./Video');
const CourseDocument = require('./CourseDocument');
const CourseVideo = require('./CourseVideo');
const Attachment = require('./Attachment');
const Message = require('./Message');
const TrashMessage = require('./TrashMessage');

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

Teacher.hasMany(Course, { foreignKey: 'teacher_id' });
Course.belongsTo(Teacher, { foreignKey: 'teacher_id' });

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

// Update Document associations
Course.belongsToMany(Document, {
  through: CourseDocument,
  foreignKey: 'course_id',
  otherKey: 'document_id'
});
Document.belongsToMany(Course, {
  through: CourseDocument,
  foreignKey: 'document_id',
  otherKey: 'course_id'
});

// Update Video associations
Course.belongsToMany(Video, {
  through: CourseVideo,
  foreignKey: 'course_id',
  otherKey: 'video_id'
});
Video.belongsToMany(Course, {
  through: CourseVideo,
  foreignKey: 'video_id',
  otherKey: 'course_id'
});



Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

Message.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

Message.hasMany(Attachment);

Message.hasOne(TrashMessage, {
  foreignKey: 'originalMessageId',
});
TrashMessage.belongsTo(Message, {
  foreignKey: 'originalMessageId',
});

TrashMessage.belongsTo(User, { as: 'deletedByUser', foreignKey: 'deletedBy' });

Attachment.belongsTo(Message);

// Association User-Avatar (One-to-One)
User.hasOne(UserAvatar, { foreignKey: 'user_id', as: 'avatar' });
UserAvatar.belongsTo(User, { foreignKey: 'user_id' });

// Export models and sequelize instance
module.exports = {
  User,
  Admin,
  Attachment,
  Message,
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
  Document,
  Video,
  TrashMessage,  // Add TrashMessage to exports
  CourseDocument,  // Add CourseDocument to exports
  CourseVideo,     // Add CourseVideo to exports
  sequelize,
};
