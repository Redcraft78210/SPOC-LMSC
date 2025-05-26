const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Document, Course, CourseDocument } = require('../models');

const documentsDirectory = path.resolve(__dirname, '..', 'documents');

console.log(`documentsDirectory: ${documentsDirectory}`);

// Common headers
const COMMON_HEADERS = {
    'Cache-Control': 'public, max-age=3600',
    'Content-Security-Policy': "default-src 'none'",
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff'
};

/**
 * Check if the provided file path is inside the documents directory.
 * @param {string} filePath 
 * @returns {boolean}
 */
const isInsideDocumentsDir = (filePath) => {
    const relative = path.relative(documentsDirectory, filePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
};

/**
 * Generate ETag from file content
 * @param {Buffer} fileData
 * @returns {string}
 */
const generateETag = (fileData) => {
    const hash = crypto.createHash('sha1');
    hash.update(fileData);
    return hash.digest('hex');
};

// Ajouter une fonction pour générer le chemin de fichier basé sur l'ID
const generateDocumentPath = (id, fingerprint) => {
    // Le chemin est fixe, le nom du fichier est basé sur l'ID
    return path.resolve(documentsDirectory, `${id}-${fingerprint}.pdf`);
};

/**
 * Get document as blob with additional security headers.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getBlobDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format more thoroughly
        if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        // Check if document is in database
        const document = await Document.findOne({
            where: { id },
            include: {
                model: Course,
                attributes: ['title']
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const fingerprint = document.fingerprint;

        // Use path.join for better path construction
        const documentPath = generateDocumentPath(id, fingerprint)

        // Safely access document title
        const documentTitle = document.Course?.title;

        const escapedFilename = documentTitle 
            ? encodeURIComponent(`${documentTitle}.pdf`) 
            : encodeURIComponent(`${id}-${fingerprint}.pdf`);

        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Invalid path' });
        }

        if (!fsSync.existsSync(documentPath)) {
            console.error('File not found:', documentPath);
            return res.status(404).json({ message: 'Document not found' });
        }

        // Use fs.promises to avoid callback hell
        const handle = await fs.open(documentPath, 'r');
        try {
            const stats = await handle.stat();
            const buffer = await handle.readFile();

            // Set proper PDF content type without charset
            res.writeHead(200, {
                ...COMMON_HEADERS,
                'Content-Length': buffer.length,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename*="UTF-8''${escapedFilename}"`,
                'ETag': `"${generateETag(buffer)}"`
            });

            res.end(buffer);
        } finally {
            await handle.close();
        }
    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'Document not found' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

const uploadDocument = async (req, res) => {
    try {
        // Auth
        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        // Récupérer le fingerprint depuis la base de données ou en générer un nouveau
        let fingerprint = req.body.fingerprint || crypto.randomBytes(8).toString('hex');
        const courseId = req.body.courseId; // Récupérer l'ID du cours associé
        const isMain = req.body.isMain || false; // Document principal ou non
        
        // Utiliser generateDocumentPath pour la cohérence
        const documentPath = generateDocumentPath(id, fingerprint);
        
        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        // Créer le répertoire parent si nécessaire
        await fs.mkdir(path.dirname(documentPath), { recursive: true });

        // Gestion de l'upload de fichier
        const fileData = [];
        req.on('data', (chunk) => {
            fileData.push(chunk);
        });
        
        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(fileData);
                await fs.writeFile(documentPath, buffer);
                
                // Enregistrer ou mettre à jour le document dans la base de données
                const [document, created] = await Document.upsert({
                    id,
                    fingerprint,
                    title: req.body.title || `Document ${id}`,
                    description: req.body.description
                }, { returning: true });
                
                // Créer l'association avec le cours si un courseId est fourni
                if (courseId) {
                    await CourseDocument.upsert({
                        course_id: courseId,
                        document_id: id,
                        is_main: isMain
                    });
                }
                
                res.status(201).json({ 
                    message: 'Document téléchargé avec succès',
                    id,
                    fingerprint,
                    courseId: courseId || null,
                    isMain
                });
            } catch (error) {
                console.error('Erreur lors de l\'écriture du fichier:', error);
                res.status(500).json({ message: 'Erreur interne du serveur' });
            }
        });

    } catch (error) {
        console.error('Erreur serveur:', error);
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Erreur interne'
            });
        }
    }
};

const deleteDocument = async (req, res) => {
    try {
        // Auth
        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        // Récupérer le document de la base de données pour obtenir le fingerprint
        const document = await Document.findByPk(id);
        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        // Utiliser generateDocumentPath pour la cohérence
        const documentPath = generateDocumentPath(id, document.fingerprint);
        
        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        // Vérifier si le fichier existe avant de le supprimer
        try {
            await fs.access(documentPath);
            await fs.unlink(documentPath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // Si le fichier n'existe pas, on continue avec la suppression en base
        }
        
        // Supprimer les associations dans CourseDocument
        const { CourseDocument } = require('../models');
        await CourseDocument.destroy({ where: { document_id: id }});
        
        // Supprimer le document de la base de données
        await document.destroy();
        
        res.status(200).json({ message: 'Document supprimé avec succès' });

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
    getBlobDocument,
    uploadDocument,
    deleteDocument
};