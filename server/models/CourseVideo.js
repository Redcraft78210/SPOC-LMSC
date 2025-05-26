const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseVideo = sequelize.define('CourseVideo', {
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
  video_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'videos',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'course_videos',
  timestamps: false
});

module.exports = CourseVideo;