/**
 * @fileoverview
 * Point d'entrée principal pour les modèles Sequelize de l'application SPOC-LMSC.
 * Ce module configure et exporte tous les modèles de base de données avec leurs associations,
 * définissant les relations entre utilisateurs, cours, classes, documents, vidéos et autres entités.
 * Il centralise la configuration des relations many-to-many, one-to-many et one-to-one
 * pour maintenir l'intégrité référentielle de la base de données.
 */

const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
sequelize.Op = Sequelize.Op;

/**
 * Modèle User - Représente les utilisateurs de la plateforme
 * @type {import('sequelize').Model}
 */
const User = require('./User');

/**
 * Modèle CourseProgress - Suivi de progression des cours par utilisateur
 * @type {import('sequelize').Model}
 */
const CourseProgress = require('./CourseProgress');

/**
 * Modèle LiveAttendance - Présence des utilisateurs aux sessions en direct
 * @type {import('sequelize').Model}
 */
const LiveAttendance = require('./LiveAttendance');

/**
 * Modèle Student - Informations spécifiques aux étudiants
 * @type {import('sequelize').Model}
 */
const Student = require('./Student');

/**
 * Modèle StudentClass - Table de liaison étudiants-classes
 * @type {import('sequelize').Model}
 */
const StudentClass = require('./StudentClass');

/**
 * Modèle Classe - Représente les classes d'étudiants
 * @type {import('sequelize').Model}
 */
const Classe = require('./Classe');

/**
 * Modèle Lives - Sessions de cours en direct
 * @type {import('sequelize').Model}
 */
const Lives = require('./Lives');

/**
 * Modèle Teacher - Informations spécifiques aux enseignants
 * @type {import('sequelize').Model}
 */
const Teacher = require('./Teacher');

/**
 * Modèle ClassLives - Table de liaison classes-sessions en direct
 * @type {import('sequelize').Model}
 */
const ClassLives = require('./ClassLives');

/**
 * Modèle Course - Représente les cours disponibles
 * @type {import('sequelize').Model}
 */
const Course = require('./Course');

/**
 * Modèle Admin - Informations spécifiques aux administrateurs
 * @type {import('sequelize').Model}
 */
const Admin = require('./Admin');

/**
 * Modèle Code - Codes d'invitation pour l'inscription
 * @type {import('sequelize').Model}
 */
const Code = require('./Code');

/**
 * Modèle Comment - Commentaires sur les threads de discussion
 * @type {import('sequelize').Model}
 */
const Comment = require('./Comment');

/**
 * Modèle Thread - Threads de discussion
 * @type {import('sequelize').Model}
 */
const Thread = require('./Thread');

/**
 * Modèle ChatMessage - Messages de chat en temps réel
 * @type {import('sequelize').Model}
 */
const ChatMessage = require('./ChatMessage');

/**
 * Modèle UserAvatar - Avatars des utilisateurs
 * @type {import('sequelize').Model}
 */
const UserAvatar = require('./UserAvatar');

/**
 * Modèle Document - Documents PDF associés aux cours
 * @type {import('sequelize').Model}
 */
const Document = require('./Document');

/**
 * Modèle Video - Vidéos associées aux cours
 * @type {import('sequelize').Model}
 */
const Video = require('./Video');

/**
 * Modèle CourseDocument - Table de liaison cours-documents
 * @type {import('sequelize').Model}
 */
const CourseDocument = require('./CourseDocument');

/**
 * Modèle CourseVideo - Table de liaison cours-vidéos
 * @type {import('sequelize').Model}
 */
const CourseVideo = require('./CourseVideo');

/**
 * Modèle Attachment - Pièces jointes aux messages
 * @type {import('sequelize').Model}
 */
const Attachment = require('./Attachment');

/**
 * Modèle Message - Messages privés entre utilisateurs
 * @type {import('sequelize').Model}
 */
const Message = require('./Message');

/**
 * Modèle Recipient - Destinataires des messages
 * @type {import('sequelize').Model}
 */
const Recipient = require('./Recipient');

/**
 * Modèle TrashMessage - Messages supprimés
 * @type {import('sequelize').Model}
 */
const TrashMessage = require('./TrashMessage');

/**
 * Modèle Warning - Avertissements émis aux utilisateurs
 * @type {import('sequelize').Model}
 */
const Warning = require('./Warning');

/**
 * Modèle Flag - Signalements de contenu inapproprié
 * @type {import('sequelize').Model}
 */
const Flag = require('./Flag');

// Relations Many-to-Many entre Course et Student via table Enrollments
Course.belongsToMany(Student, { through: 'Enrollments' });
Student.belongsToMany(Course, { through: 'Enrollments' });

// Relations Many-to-Many entre Student et Classe via StudentClass
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

// Relations Many-to-Many entre Classe et Lives via ClassLives
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

// Relations One-to-Many pour les messages de chat
Lives.hasMany(ChatMessage, { foreignKey: 'live_id' });
ChatMessage.belongsTo(Lives, { foreignKey: 'live_id' });

User.hasMany(ChatMessage, { foreignKey: 'user_id' });
ChatMessage.belongsTo(User, { foreignKey: 'user_id' });

// Relations One-to-Many pour les enseignants
Teacher.hasMany(Lives, { foreignKey: 'teacher_id' });
Lives.belongsTo(Teacher, { foreignKey: 'teacher_id' });

Teacher.hasMany(Course, { foreignKey: 'teacher_id' });
Course.belongsTo(Teacher, { foreignKey: 'teacher_id' });

// Relations One-to-Many pour les threads et commentaires
User.hasMany(Thread, { foreignKey: 'authorId' });
Thread.belongsTo(User, { foreignKey: 'authorId' });

User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

Thread.hasMany(Comment, { foreignKey: 'threadId' });
Comment.belongsTo(Thread, { foreignKey: 'threadId' });

// Relations pour le suivi de progression des cours
CourseProgress.belongsTo(Student, { foreignKey: 'user_id' });
Student.hasMany(CourseProgress, { foreignKey: 'user_id' });

CourseProgress.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(CourseProgress, { foreignKey: 'course_id' });

// Relations pour la présence aux sessions en direct
LiveAttendance.belongsTo(Student, { foreignKey: 'user_id' });
Student.hasMany(LiveAttendance, { foreignKey: 'user_id' });

LiveAttendance.belongsTo(Lives, { foreignKey: 'live_id' });
Lives.hasMany(LiveAttendance, { foreignKey: 'live_id' });

// Relations Many-to-Many entre Course et Document via CourseDocument
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

// Relations Many-to-Many entre Course et Video via CourseVideo
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

// Relations pour le système de messagerie
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

Message.hasMany(Recipient, {
  foreignKey: 'MessageId',
});

Recipient.belongsTo(User, { foreignKey: 'recipientId' });
Recipient.belongsTo(Message, { foreignKey: 'MessageId' });

Message.hasMany(Attachment);

// Relations pour les messages supprimés
Message.hasOne(TrashMessage, {
  foreignKey: 'originalMessageId',
});
TrashMessage.belongsTo(Message, {
  foreignKey: 'originalMessageId',
});

TrashMessage.belongsTo(User, { as: 'deletedByUser', foreignKey: 'deletedBy' });

Attachment.belongsTo(Message);

// Relations pour les avatars utilisateur
User.hasOne(UserAvatar, { foreignKey: 'user_id', as: 'avatar' });
UserAvatar.belongsTo(User, { foreignKey: 'user_id' });

// Relations pour les avertissements
Warning.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Warning.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });

// Relations pour les signalements
Flag.belongsTo(User, { as: 'reporter', foreignKey: 'reportedBy' });
Flag.belongsTo(User, { as: 'resolver', foreignKey: 'resolvedBy' });

/**
 * Exporte tous les modèles configurés avec leurs associations pour utilisation dans l'application.
 * 
 * @exports {Object} Objet contenant tous les modèles Sequelize organisés par catégorie
 * @property {Object} User - Modèle des utilisateurs
 * @property {Object} Student - Modèle des étudiants
 * @property {Object} Teacher - Modèle des enseignants
 * @property {Object} Admin - Modèle des administrateurs
 * @property {Object} UserAvatar - Modèle des avatars utilisateur
 * @property {Object} Course - Modèle des cours
 * @property {Object} CourseProgress - Modèle de progression des cours
 * @property {Object} Document - Modèle des documents
 * @property {Object} Video - Modèle des vidéos
 * @property {Object} CourseDocument - Modèle de liaison cours-documents
 * @property {Object} CourseVideo - Modèle de liaison cours-vidéos
 * @property {Object} Classe - Modèle des classes
 * @property {Object} Lives - Modèle des sessions en direct
 * @property {Object} ClassLives - Modèle de liaison classes-sessions
 * @property {Object} LiveAttendance - Modèle de présence aux sessions
 * @property {Object} ChatMessage - Modèle des messages de chat
 * @property {Object} StudentClass - Modèle de liaison étudiants-classes
 * @property {Object} Thread - Modèle des threads de discussion
 * @property {Object} Comment - Modèle des commentaires
 * @property {Object} Message - Modèle des messages privés
 * @property {Object} Recipient - Modèle des destinataires
 * @property {Object} Attachment - Modèle des pièces jointes
 * @property {Object} TrashMessage - Modèle des messages supprimés
 * @property {Object} Code - Modèle des codes d'invitation
 * @property {Object} sequelize - Instance de connexion Sequelize
 * @property {Object} Warning - Modèle des avertissements
 * @property {Object} Flag - Modèle des signalements
 * 
 * @example
 * // Utilisation des modèles dans un contrôleur
 * const { User, Course, Student } = require('./models');
 * 
 * // Récupération d'un utilisateur avec ses cours
 * const user = await User.findByPk(userId, {
 *   include: [{ model: Course, through: 'Enrollments' }]
 * });
 * 
 * @example
 * // Création d'une nouvelle association cours-document
 * const { Course, Document, CourseDocument } = require('./models');
 * 
 * await CourseDocument.create({
 *   course_id: courseId,
 *   document_id: documentId,
 *   is_main: true
 * });
 */
module.exports = {
  User,
  Student,
  Teacher,
  Admin,
  UserAvatar,
  
  Course,
  CourseProgress,
  Document,
  Video,
  CourseDocument,
  CourseVideo,
  
  Classe,
  Lives,
  ClassLives,
  LiveAttendance,
  ChatMessage,
  StudentClass,
  
  Thread,
  Comment,
  
  Message,
  Recipient,
  Attachment,
  TrashMessage,
  
  Code,
  
  sequelize,
  Warning,
  Flag,
};
