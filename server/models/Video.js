const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    course_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Course',
            key: 'id'
        }
    },
    commit_msg: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Video;
