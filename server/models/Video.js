const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    course_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Course',
            key: 'id'
        }
    },
    fingerprint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commit_msg: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'videos',
    timestamps: true
});

module.exports = Video;
