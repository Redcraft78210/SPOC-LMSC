import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { constants } from 'fs';

const videosDirectory = path.resolve(__dirname, '../');
console.log(`videosDirectory: ${videosDirectory}`);

/**
 * @description Stream a video file by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVideo = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        const videoPath = path.resolve(videosDirectory, `${id}.mp4`);
        
        // Vérification de sécurité du chemin
        if (!videoPath.startsWith(videosDirectory)) {
            return res.status(400).json({ message: 'Invalid path' });
        }

        // Vérification asynchrone de l'existence du fichier
        try {
            await fs.access(videoPath, constants.F_OK | constants.R_OK);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'Video not found' });
            }
            throw err;
        }

        // Récupération des métadonnées pour Content-Length
        const stats = await fs.stat(videoPath);
        
        // Configuration des headers
        res.writeHead(200, {
            'Content-Length': stats.size,
            'Content-Type': 'video/mp4',
            'Cache-Control': 'public, max-age=3600',
            'ETag': `"${stats.mtimeMs}"`
        });

        // Stream du fichier
        const videoStream = createReadStream(videoPath);
        
        videoStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Streaming error' });
            }
        });

        videoStream.pipe(res);

    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

export default {
    getVideo
};