/**
 * @fileoverview Contrôleur pour la gestion des sessions de diffusion en direct (lives).
 * Fournit des fonctionnalités CRUD et de gestion d'état pour les sessions de diffusion.
 * Inclut également des fonctionnalités pour générer des vignettes à partir des vidéos.
 */

const { Lives, ClassLives, Classe, Teacher } = require('../models');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

/**
 * Récupère une session de diffusion spécifique par son ID.
 * Les étudiants ne peuvent voir que les sessions en cours ou planifiées.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - Les informations de l'utilisateur connecté
 * @param {string} req.user.role - Le rôle de l'utilisateur (ex: 'Etudiant', 'Teacher')
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à récupérer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Les données de la session avec le nom du professeur
 * @throws {Error} Erreur lors de la récupération des données
 */
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

/**
 * Récupère toutes les sessions de diffusion disponibles.
 * Les étudiants ne peuvent voir que les sessions en cours ou planifiées.
 * Structure les données par professeur, matière et chapitre.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.user - Les informations de l'utilisateur connecté
 * @param {string} req.user.role - Le rôle de l'utilisateur
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Les données structurées des sessions
 * @throws {Error} Erreur lors de la récupération des données
 */
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

/**
 * Récupère les sessions de diffusion pour une classe spécifique.
 * Génère également des vignettes pour chaque vidéo si elles n'existent pas 
 * ou sont trop anciennes.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.classId - L'ID de la classe
 * @param {Object} res - L'objet réponse Express
 * @returns {Array} Les sessions de diffusion pour la classe spécifiée
 * @throws {Error} Erreur lors de la récupération ou du traitement des données
 */
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

/**
 * Ajoute une nouvelle session de diffusion.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.body - Les données de la session à créer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session nouvellement créée
 * @throws {Error} Erreur lors de la création de la session
 */
const addLive = async (req, res) => {
    try {
        const live = await Lives.create(req.body);
        res.status(201).json(live);
    } catch (error) {
        res.status(500).json({ message: 'Error adding live data', error });
    }
};

/**
 * Démarre une session de diffusion en changeant son statut à 'ongoing'.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à démarrer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session mise à jour
 * @throws {Error} Erreur lors de la mise à jour du statut
 */
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

/**
 * Termine une session de diffusion en changeant son statut à 'completed'.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à terminer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session mise à jour
 * @throws {Error} Erreur lors de la mise à jour du statut
 */
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

/**
 * Désapprouve une session de diffusion en changeant son statut à 'disapproved'
 * avec une justification.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à désapprouver
 * @param {Object} req.body - Les données de la requête
 * @param {string} req.body.justification - La raison de la désapprobation
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session mise à jour
 * @throws {Error} Erreur lors de la mise à jour du statut
 */
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
};

/**
 * Bloque une session de diffusion en changeant son statut à 'blocked'.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à bloquer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session mise à jour
 * @throws {Error} Erreur lors de la mise à jour du statut
 */
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

/**
 * Débloque une session de diffusion en changeant son statut à 'scheduled'.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à débloquer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session mise à jour
 * @throws {Error} Erreur lors de la mise à jour du statut
 */
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

/**
 * Modifie les détails d'une session de diffusion existante.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à modifier
 * @param {Object} req.body - Les nouvelles données de la session
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} La session mise à jour
 * @throws {Error} Erreur lors de la mise à jour des données
 */
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

/**
 * Supprime une session de diffusion.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.params - Les paramètres de la requête
 * @param {string} req.params.id - L'ID de la session à supprimer
 * @param {Object} res - L'objet réponse Express
 * @returns {Object} Message de confirmation de suppression
 * @throws {Error} Erreur lors de la suppression
 */
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
