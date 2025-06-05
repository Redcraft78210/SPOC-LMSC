const { Lives, ClassLives, Classe, Teacher } = require('../models');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Example controller functions
const getLive = async (req, res) => {
    let userRole = req.user.role;
    let whereCondition;
    if (userRole === 'Etudiant') {
        whereCondition = {
            status: { [Op.or]: ['ongoing', 'scheduled'] },
        };
    }
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id, whereCondition);

        if (live) {
            const teacher = await Teacher.findByPk(live.teacher_id, { attributes: ['surname'] });
            if (teacher) {
                live.dataValues.professor = teacher.surname;
            }
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving live data', error });
    }
};

const getAllLives = async (req, res) => {
    let userRole = req.user.role;
    let whereCondition;
    if (userRole === 'Etudiant') {
        whereCondition = {
            status: { [Op.or]: ['ongoing', 'scheduled'] },
        };
    }

    try {
        const lives = await Lives.findAll({
            where: whereCondition,
            include: [
                { model: Teacher, attributes: ['surname'] }
            ]
        });

        // Transformation des données en structure imbriquée
        const structuredData = {};

        lives.forEach(live => {
            const professor = live.Teacher ? 'Professeur ' + live.Teacher.surname : 'Unknown Professor';
            const subject = live.subject || 'Unknown Subject';
            const topic = live.chapter || 'Unknown Topic';

            if (!structuredData[professor]) {
                structuredData[professor] = {};
            }

            if (!structuredData[professor][subject]) {
                structuredData[professor][subject] = {};
            }

            if (!structuredData[professor][subject][topic]) {
                structuredData[professor][subject][topic] = {};
            }

            structuredData[professor][subject][topic] = {
                titre: live.title,
                description: live.description,
                date_creation: live.createdAt,
                id: live.id,
                type: 'live',
                live: {
                    date_debut: live.start_time,
                    date_fin: live.end_time,
                    statut: live.status,
                    block_reason: live.block_reason
                }
            };
        });

        res.status(200).json(structuredData);
    } catch (error) {
        console.error('Error retrieving all live data:', error);
        res.status(500).json({ message: 'Error retrieving all live data', error });
    }
};

const getLiveByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const lives = await Lives.findAll({
            attributes: ['id', 'title', 'description', 'link'],
            include: [{
                model: Classe,
                where: { id: classId },
                through: {
                    model: ClassLives,
                    as: 'ClassLives'
                },
                attributes: []
            }],
            include: [{
                model: Teacher,
                attributes: ['username']
            }]
        });
        // Définir le dossier racine de votre site
        const baseDir = process.cwd(); // ou __dirname selon votre configuration

        const promises = lives.map(async live => {
            const absoluteLiveLink = path.join(baseDir, 'streaming', live.id, 'stream.mp4');
            const thumbnail = path.join(baseDir, 'streaming', live.id, 'thumbnail.webp');

            try {
                const fileStats = fs.statSync(thumbnail);
                const timeElapsed = (Date.now() - fileStats.mtimeMs) / 1000 / 60;
                if (timeElapsed > 0.5) {
                    console.log('Thumbnail is old, generating a new one');
                    await new Promise((resolve, reject) => {
                        ffmpeg.ffprobe(absoluteLiveLink, (err, metadata) => {
                            if (err) {
                                console.error('Error retrieving video metadata:', err);
                                return;
                            }

                            const duration = metadata.format.duration; // Video duration in seconds
                            const timestamp = duration - 0.1; // 5 seconds before the end

                            const ffmpegProcess = ffmpeg(absoluteLiveLink)
                                .setStartTime(timestamp)
                                .setDuration('0.1')
                                .output(thumbnail)
                                .size('160x90')
                                .outputOptions([
                                    '-loglevel error',
                                    '-vsync vfr',
                                    '-frames:v 1',
                                    '-update 1'
                                ])
                                .on('start', (commandLine) => {
                                    console.log(`FFmpeg command: ${commandLine}`);
                                })
                                .on('end', () => {
                                    if (fs.existsSync(thumbnail)) {
                                        console.log(`Thumbnail created: ${thumbnail}`);
                                        resolve();
                                    } else {
                                        reject(new Error('Thumbnail generation failed silently'));
                                    }
                                })
                                .on('error', (err) => {
                                    if (fs.existsSync(thumbnail)) {
                                        fs.unlinkSync(thumbnail);
                                    }
                                    console.error('FFmpeg error:', {
                                        message: err.message,
                                        stack: err.stack,
                                        code: err.code
                                    });
                                    reject(new Error(`Thumbnail generation failed: ${err.message}`));
                                });

                            const timeout = setTimeout(() => {
                                ffmpegProcess.kill('SIGTERM');
                                reject(new Error('FFmpeg timed out after 30 seconds'));
                            }, 30000);

                            ffmpegProcess.on('end', () => clearTimeout(timeout)).run();
                        });
                    });
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log('Thumbnail does not exist, generating a new one');
                    await new Promise((resolve, reject) => {
                        ffmpeg.ffprobe(absoluteLiveLink, (err, metadata) => {
                            if (err) {
                                console.error('Error retrieving video metadata:', err);
                                return;
                            }

                            const duration = metadata.format.duration; // Video duration in seconds
                            const timestamp = duration - 0.1; // 5 seconds before the end


                            const ffmpegProcess = ffmpeg(absoluteLiveLink)
                                .setStartTime(timestamp)
                                .setDuration('0.1')
                                .output(thumbnail)
                                .size('160x90')
                                .outputOptions([
                                    '-loglevel error',
                                    '-vsync vfr',
                                    '-frames:v 1'
                                ])
                                .on('start', (commandLine) => {
                                    console.log(`FFmpeg command: ${commandLine}`);
                                })
                                .on('end', () => {
                                    if (fs.existsSync(thumbnail)) {
                                        console.log(`Thumbnail created: ${thumbnail}`);
                                        resolve();
                                    } else {
                                        reject(new Error('Thumbnail generation failed silently'));
                                    }
                                })
                                .on('error', (err) => {
                                    if (fs.existsSync(thumbnail)) {
                                        fs.unlinkSync(thumbnail);
                                    }
                                    console.error('FFmpeg error:', {
                                        message: err.message,
                                        stack: err.stack,
                                        code: err.code
                                    });
                                    reject(new Error(`Thumbnail generation failed: ${err.message}`));
                                });

                            const timeout = setTimeout(() => {
                                ffmpegProcess.kill('SIGTERM');
                                reject(new Error('FFmpeg timed out after 30 seconds'));
                            }, 30000);

                            ffmpegProcess.on('end', () => clearTimeout(timeout)).run();
                        });
                    });
                } else {
                    throw error;
                }
            }
            return live;
        });

        const results = await Promise.all(promises);
        if (results.length === 0) {
            res.status(404).json({ message: 'No lives found for class' });
        } else {
            res.json(results);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving live data by class', error });
    }
};

const addLive = async (req, res) => {
    try {
        const live = await Lives.create(req.body);
        res.status(201).json(live);
    } catch (error) {
        res.status(500).json({ message: 'Error adding live data', error });
    }
};

const startLive = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id);
        if (live) {
            live.status = 'ongoing';
            await live.save();
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error starting live data', error });
    }
};

const endLive = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id);
        if (live) {
            live.status = 'completed';
            await live.save();
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error ending live data', error });
    }
};

const disapproveLive = async (req, res) => {
    const { justification } = req.body;
    if (!justification) {
        return res.status(400).json({ message: 'Justification is required' });
    }
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id);
        if (live) {
            live.status = 'disapproved';
            live.block_reason = justification;
            await live.save();
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error disapproving live data', error });
    }
}

const blockLive = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id);
        if (live) {
            live.status = 'blocked';
            await live.save();
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error blocking live data', error });
    }
};

const unblockLive = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await Lives.findByPk(id);
        if (live) {
            live.status = 'scheduled';
            await live.save();
            res.json(live);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error unblocking live data', error });
    }
};

const editLive = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Lives.update(req.body, {
            where: { id }
        });
        if (updated) {
            const updatedLive = await Lives.findByPk(id);
            res.json(updatedLive);
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error editing live data', error });
    }
};

const deleteLive = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Lives.destroy({
            where: { id }
        });
        if (deleted) {
            res.json({ message: `Live data with ID ${id} deleted successfully` });
        } else {
            res.status(404).json({ message: 'Live data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting live data', error });
    }
};

module.exports = {
    getLive,
    getAllLives,
    getLiveByClass,
    addLive,
    editLive,
    deleteLive,
    startLive,
    endLive,
    disapproveLive,
    blockLive,
    unblockLive
};
