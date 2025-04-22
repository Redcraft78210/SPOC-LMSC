const fs = require('fs/promises');
const path = require('path');
const { createReadStream } = require('fs');
const { constants } = require('fs');
const { spawn } = require('child_process'); // pour ffprobe si besoin

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

const getVideo = async (req, res) => {
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
            res.status(404).end();
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

module.exports = {
    getVideo
};
