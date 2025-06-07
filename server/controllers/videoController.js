/**
 * @fileoverview Contrôleur pour la gestion des vidéos de la plateforme.
 * Fournit des fonctionnalités pour diffuser, télécharger, uploader, supprimer 
 * et récupérer des informations sur les vidéos.
 * @module videoController
 */

const fs = require('fs/promises');
const path = require('path');
const { createReadStream } = require('fs');
const { constants } = require('fs');
const { Video } = require('../models');

const jwt = require('jsonwebtoken');

/** 
 * Chemin absolu vers le répertoire de stockage des vidéos
 * @constant {string}
 */
const videosDirectory = path.resolve(__dirname, '..', 'videos');

/**
 * Configure les en-têtes CORS sur la réponse HTTP.
 * @param {Object} res - L'objet réponse Express.
 */
const setCORSHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // ajuster selon la politique de sécurité
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
};

/**
 * Vérifie si un chemin de fichier est contenu dans un répertoire de base.
 * Utilisé comme mesure de sécurité pour prévenir les attaques de traversée de répertoire.
 * @param {string} filePath - Le chemin du fichier à vérifier.
 * @param {string} baseDirectory - Le répertoire de base qui devrait contenir le fichier.
 * @returns {boolean} true si le fichier est à l'intérieur du répertoire, false sinon.
 */
const isInsideDirectory = (filePath, baseDirectory) => {
    const relative = path.relative(baseDirectory, filePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
};

/**
 * Analyse l'en-tête HTTP Range pour la diffusion de vidéo par morceaux.
 * @param {string} rangeHeader - L'en-tête HTTP Range.
 * @param {number} fileSize - La taille totale du fichier en octets.
 * @returns {Object|null} Un objet contenant les positions de début et de fin, ou null si l'en-tête est invalide.
 * @returns {number} start - Position de début en octets.
 * @returns {number} end - Position de fin en octets.
 */
const parseRange = (rangeHeader, fileSize) => {
    if (!rangeHeader) return null;

    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize) {
        return null;
    }

    return { start, end };
};

/**
 * Génère le chemin d'accès complet pour un fichier vidéo.
 * @param {string} id - L'identifiant unique de la vidéo.
 * @param {string} fingerprint - L'empreinte de sécurité de la vidéo.
 * @returns {string} Le chemin d'accès complet au fichier vidéo.
 */
const generateVideoPath = (id, fingerprint) => {
    return path.resolve(videosDirectory, `${id}-${fingerprint}.mp4`);
};

/**
 * Récupère et diffuse une vidéo en streaming avec prise en charge des plages (ranges) HTTP.
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'identifiant de la vidéo.
 * @param {Object} req.query - Les paramètres de la requête.
 * @param {string} req.query.authToken - Le token d'authentification JWT.
 * @param {Object} req.headers - Les en-têtes de la requête.
 * @param {string} [req.headers.range] - L'en-tête HTTP Range pour la diffusion partielle.
 * @param {Object} res - L'objet réponse Express.
 * @throws {Error} Si la vidéo n'existe pas ou si l'accès est refusé.
 */
const getVideo = async (req, res) => {
    try {
        setCORSHeaders(res);

        const { authToken } = req.query;
        if (!authToken) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        try {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }


        const video = await Video.findOne({ where: { id } });
        if (!video) {
            return res.status(404).json({ message: 'Vidéo non trouvée' });
        }

        const videoPath = generateVideoPath(id, video.fingerprint);
        if (!isInsideDirectory(videoPath, videosDirectory)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        await fs.access(videoPath, constants.F_OK | constants.R_OK);
        const stats = await fs.stat(videoPath);


        const range = parseRange(req.headers.range, stats.size);

        const headers = {
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'private, max-age=3600',
            'Content-Length': range ? range.end - range.start + 1 : stats.size,
            'Connection': 'keep-alive'
        };

        if (range) {
            headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stats.size}`;
            res.writeHead(206, headers);
        } else {
            res.status(200).set(headers);
        }

        const stream = createReadStream(videoPath, range ? {
            start: range.start,
            end: range.end
        } : {});

        stream.on('error', (err) => {
            console.error('Erreur stream :', err);
            if (!res.headersSent) res.status(500).end();
        });

        stream.pipe(res);

    } catch (error) {
        console.error('Erreur serveur:', error);
        if (!res.headersSent) {
            res.status(error.code === 'ENOENT' ? 404 : 500).json({
                message: error.message || 'Erreur interne'
            });
        }
    }
};

/**
 * Permet le téléchargement complet d'une vidéo.
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'identifiant de la vidéo.
 * @param {Object} req.user - Les informations de l'utilisateur authentifié.
 * @param {Object} req.headers - Les en-têtes de la requête.
 * @param {string} [req.headers.range] - L'en-tête HTTP Range pour le téléchargement partiel.
 * @param {Object} res - L'objet réponse Express.
 * @throws {Error} Si la vidéo n'existe pas ou si l'accès est refusé.
 */
const downloadVideo = async (req, res) => {
    try {
        setCORSHeaders(res);

        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }
        const videoPath = path.resolve(videosDirectory, `${id}/${id}.mp4`);
        if (!isInsideDirectory(videoPath, videosDirectory)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }
        await fs.access(videoPath, constants.F_OK | constants.R_OK);
        const stats = await fs.stat(videoPath);
        const range = parseRange(req.headers.range, stats.size);
        const headers = {
            'Content-Type': 'octet/stream',
            'Content-Disposition': `attachment; filename="${id}.mp4"`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'private, max-age=3600',
            'Content-Length': range ? range.end - range.start + 1 : stats.size,
            'Connection': 'keep-alive'
        };
        if (range) {
            headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stats.size}`;
            res.writeHead(206, headers);
        } else {
            headers['Content-Range'] = `bytes 0-${stats.size - 1}/${stats.size}`;
            res.writeHead(200, headers);
        }

    } catch (error) {
        console.error('Erreur serveur:', error);
        if (!res.headersSent) {
            res.status(error.code === 'ENOENT' ? 404 : 500).json({
                message: error.message || 'Erreur interne'
            });
        }
    }
};

/**
 * Téléverse une vidéo sur le serveur.
 * @param {Object} req - L'objet requête Express contenant les données de la vidéo.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'identifiant à attribuer à la vidéo.
 * @param {Object} req.user - Les informations de l'utilisateur authentifié.
 * @param {Object} res - L'objet réponse Express.
 * @throws {Error} Si l'ID est invalide ou si l'accès est refusé.
 */
const uploadVideo = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const videoPath = path.resolve(videosDirectory, `${id}/${id}.mp4`);
        if (!isInsideDirectory(videoPath, videosDirectory)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        await fs.mkdir(path.dirname(videoPath), { recursive: true });

        const writeStream = fs.createWriteStream(videoPath);
        req.pipe(writeStream);

        writeStream.on('finish', () => {
            res.status(201).json({ message: 'Vidéo téléchargée avec succès' });
        });

    } catch (error) {
        console.error('Erreur serveur:', error);
        if (!res.headersSent) {
            res.status(error.code === 'ENOENT' ? 404 : 500).json({
                message: error.message || 'Erreur interne'
            });
        }
    }
};

/**
 * Supprime une vidéo du serveur.
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'identifiant de la vidéo à supprimer.
 * @param {Object} req.user - Les informations de l'utilisateur authentifié.
 * @param {Object} res - L'objet réponse Express.
 * @throws {Error} Si la vidéo n'existe pas ou si l'accès est refusé.
 */
const deleteVideo = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const videoPath = path.resolve(videosDirectory, `${id}/${id}.mp4`);
        if (!isInsideDirectory(videoPath, videosDirectory)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        await fs.unlink(videoPath);
        res.status(200).json({ message: 'Vidéo supprimée avec succès' });

    } catch (error) {
        console.error('Erreur serveur:', error);
        if (!res.headersSent) {
            res.status(error.code === 'ENOENT' ? 404 : 500).json({
                message: error.message || 'Erreur interne'
            });
        }
    }
};

/**
 * Récupère les métadonnées d'une vidéo.
 * @param {Object} req - L'objet requête Express.
 * @param {Object} req.params - Les paramètres de la requête.
 * @param {string} req.params.id - L'identifiant de la vidéo.
 * @param {Object} req.query - Les paramètres de la requête.
 * @param {string} req.query.authToken - Le token d'authentification JWT.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Object} Les informations de la vidéo, y compris le cours associé.
 * @throws {Error} Si la vidéo n'existe pas ou si l'accès est refusé.
 */
const getVideoInfo = async (req, res) => {
    try {
        setCORSHeaders(res);

        const { authToken } = req.query;
        if (!authToken) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        try {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }


        const video = await Video.findOne({ 
            where: { id },

            include: [
                { 
                    association: 'course',
                    attributes: ['id', 'title'] 
                }
            ]
        });

        if (!video) {
            return res.status(404).json({ message: 'Vidéo non trouvée' });
        }


        res.status(200).json({
            id: video.id,
            title: video.title,
            description: video.description,
            course: video.course,
            duration: video.duration,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt
        });

    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).json({
            message: error.message || 'Erreur interne'
        });
    }
};

/**
 * Exporte les fonctions du contrôleur vidéo.
 * @exports videoController
 */
module.exports = {
    getVideo,
    uploadVideo,
    deleteVideo,
    downloadVideo,
    getVideoInfo
};
