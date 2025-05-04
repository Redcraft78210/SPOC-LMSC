const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { createReadStream } = require('fs');
const { constants } = require('fs');
const crypto = require('crypto');

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

/**
 * Stream a document file by its ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getDocument = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        const documentPath = path.resolve(documentsDirectory, `${id}/${id}.pdf`);

        console.log(`documentPath: ${documentPath}`);

        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Invalid path' });
        }

        const handle = await fs.open(documentPath, 'r');
        try {
            const stats = await handle.stat();

            // Read first 8KB for ETag generation (balance between performance and accuracy)
            const buffer = Buffer.alloc(Math.min(8192, stats.size));
            const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
            const partialHash = generateETag(bytesRead < buffer.length ? buffer.slice(0, bytesRead) : buffer);

            res.writeHead(200, {
                ...COMMON_HEADERS,
                'Content-Length': stats.size,
                'Content-Type': 'application/pdf; charset=utf-8',
                'ETag': `"${partialHash}-${stats.size}"`
            });

            const documentStream = handle.createReadStream();

            documentStream.on('error', (error) => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Streaming error' });
                }
            });

            documentStream.pipe(res);
        } finally {
            await handle.close();
        }
    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ message: 'Document non trouvé' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }
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

        // Use path.join for better path construction
        const documentPath = path.resolve(
            documentsDirectory,
            path.join(id, `${id}.pdf`)
        );
        
        const escapedFilename = encodeURIComponent(`${id}.pdf`);

        console.log(`documentPath: ${documentPath}`);

        if (!isInsideDocumentsDir(documentPath)) {
            return res.status(400).json({ message: 'Invalid path' });
        }

        if (!fsSync.existsSync(documentPath)) {
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

module.exports = {
    getDocument,
    getBlobDocument
};