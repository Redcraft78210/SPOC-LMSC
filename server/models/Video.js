const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cover_image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    },
    preview_image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    fingerprint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commit_msg: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'videos',
    timestamps: true
});

module.exports = Video;
