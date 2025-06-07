/**
 * @fileoverview Contrôleur de gestion des documents PDF pour l'application SPOC-LMSC.
 * Ce module gère le téléchargement, la récupération et la suppression des documents PDF,
 * avec vérifications de sécurité et association aux cours.
 * 
 * @module documentController
 * @requires fs/promises
 * @requires fs
 * @requires path
 * @requires crypto
 * @requires ../models
 */

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Document, Course, CourseDocument } = require('../models');

/**
 * Chemin absolu vers le répertoire de stockage des documents
 * @constant {string}
 */
const documentsDirectory = path.resolve(__dirname, '..', 'documents');

console.log(`documentsDirectory: ${documentsDirectory}`);

/**
 * En-têtes HTTP communs pour la sécurité des documents servis
 * @constant {Object}
 */
const COMMON_HEADERS = {
    'Cache-Control': 'public, max-age=3600',
    'Content-Security-Policy': "default-src 'none'",
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff'
};

/**
 * Vérifie si le chemin de fichier fourni est à l'intérieur du répertoire de documents.
 * Protection contre les attaques de traversée de répertoire.
 * 
 * @param {string} filePath - Chemin du fichier à vérifier
 * @returns {boolean} Vrai si le fichier est dans le répertoire autorisé, faux sinon
 * 
 * @example
 * // Retourne true si le fichier est dans le répertoire documents
 * isInsideDocumentsDir('/path/to/documents/file.pdf');
 */
const isInsideDocumentsDir = (filePath) => {
    const relative = path.relative(documentsDirectory, filePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
};

/**
 * Génère un ETag à partir du contenu d'un fichier pour la gestion du cache HTTP
 * 
 * @param {Buffer} fileData - Contenu du fichier en mémoire
 * @returns {string} ETag généré (hash SHA-1 du contenu)
 */
const generateETag = (fileData) => {
    const hash = crypto.createHash('sha1');
    hash.update(fileData);
    return hash.digest('hex');
};

/**
 * Génère le chemin absolu vers un document PDF
 * 
 * @param {string} id - Identifiant unique du document
 * @param {string} fingerprint - Empreinte unique du document
 * @returns {string} Chemin complet vers le fichier PDF
 */
const generateDocumentPath = (id, fingerprint) => {
    return path.resolve(documentsDirectory, `${id}-${fingerprint}.pdf`);
};

/**
 * Récupère un document PDF et le renvoie au client avec les en-têtes de sécurité appropriés
 * 
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @throws {Error} En cas d'erreur lors de la lecture du fichier ou de problème serveur
 * 
 * @example
 * // Route: GET /api/documents/:id
 */
const getBlobDocument = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

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
        const documentPath = generateDocumentPath(id, fingerprint)
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

        const handle = await fs.open(documentPath, 'r');
        try {
            const stats = await handle.stat();
            const buffer = await handle.readFile();

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

/**
 * Télécharge un nouveau document PDF ou met à jour un document existant
 * 
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @throws {Error} En cas d'erreur lors de l'écriture du fichier ou problème serveur
 * 
 * @example
 * // Route: POST /api/documents/:id
 * // Corps: données binaires du PDF avec Content-Type: application/pdf
 * // + métadonnées en formdata (courseId, isMain, title, description, fingerprint)
 */
const uploadDocument = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        let fingerprint = req.body.fingerprint || crypto.randomBytes(8).toString('hex');
        const courseId = req.body.courseId; // Récupérer l'ID du cours associé
        const isMain = req.body.isMain || false; // Document principal ou non
        
        const documentPath = generateDocumentPath(id, fingerprint);
        
        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        await fs.mkdir(path.dirname(documentPath), { recursive: true });

        const fileData = [];
        req.on('data', (chunk) => {
            fileData.push(chunk);
        });
        
        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(fileData);
                await fs.writeFile(documentPath, buffer);
                
                const [document, created] = await Document.upsert({
                    id,
                    fingerprint,
                    title: req.body.title || `Document ${id}`,
                    description: req.body.description
                }, { returning: true });
                
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

/**
 * Supprime un document PDF et ses associations dans la base de données
 * 
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @throws {Error} En cas d'erreur lors de la suppression du fichier ou problème serveur
 * 
 * @example
 * // Route: DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const document = await Document.findByPk(id);
        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        const documentPath = generateDocumentPath(id, document.fingerprint);
        
        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Chemin invalide' });
        }

        try {
            await fs.access(documentPath);
            await fs.unlink(documentPath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
        
        const { CourseDocument } = require('../models');
        await CourseDocument.destroy({ where: { document_id: id }});
        
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

/**
 * Exporte les fonctions du contrôleur de documents
 * @exports documentController
 */
module.exports = {
    getBlobDocument,
    uploadDocument,
    deleteDocument
};