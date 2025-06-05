const fs = require('fs/promises');
const path = require('path');
const { createReadStream } = require('fs');
const { constants } = require('fs');
const { Video } = require('../models');

const { spawn } = require('child_process'); // pour ffprobe si besoin
const jwt = require('jsonwebtoken');

const videosDirectory = path.resolve(__dirname, '..', 'videos');

// Middleware CORS (manuel ou utiliser 'cors' dans Express)
const setCORSHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // ajuster selon la politique de sécurité
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
};

const isInsideDirectory = (filePath, baseDirectory) => {
    const relative = path.relative(baseDirectory, filePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
};

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

// Ajouter une fonction pour générer le chemin de fichier basé sur l'ID
const generateVideoPath = (id, fingerprint) => {
    // Le chemin est fixe, le nom du fichier est basé sur l'ID
    return path.resolve(videosDirectory, `${id}-${fingerprint}.mp4`);
};

// Mettre à jour la fonction getVideo pour utiliser la nouvelle fonction
const getVideo = async (req, res) => {
    try {
        setCORSHeaders(res);
        // Auth
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

        // Check if video exists in database
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

const downloadVideo = async (req, res) => {
    try {
        setCORSHeaders(res);
        // Auth
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
}

const uploadVideo = async (req, res) => {
    try {
        // Auth
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
}

const deleteVideo = async (req, res) => {
    try {
        // Auth
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

const getVideoInfo = async (req, res) => {
    try {
        setCORSHeaders(res);
        // Auth
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

        // Récupération des informations de la vidéo depuis la base de données
        const video = await Video.findOne({ 
            where: { id },
            // Inclure les relations si la vidéo est associée à un cours
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

        // Retourner les informations de la vidéo
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

module.exports = {
    getVideo,
    uploadVideo,
    deleteVideo,
    downloadVideo,
    getVideoInfo
};
