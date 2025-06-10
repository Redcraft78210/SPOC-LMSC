/**
 * @fileoverview Contrôleur pour la gestion des avatars utilisateurs.
 * Fournit des fonctionnalités pour télécharger, récupérer, optimiser et supprimer
 * des avatars utilisateur avec optimisation d'image automatique.
 * 
 * @module controllers/avatarController
 * @requires models
 * @requires sharp
 * @requires uuid
 * @requires fs.promises
 * @requires path
 * @requires crypto
 */

const { UserAvatar } = require('../models');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Taille maximale de fichier autorisée pour les avatars (5MB)
 * @constant {number}
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max

/**
 * Types MIME autorisés pour les avatars
 * @constant {string[]}
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Répertoire temporaire pour le traitement des images
 * @constant {string}
 */
const TEMP_DIR = path.join(__dirname, '..', 'temp');

/**
 * Qualité de compression par défaut pour les images
 * @constant {number}
 */
const COMPRESSION_QUALITY = 85; // Qualité de compression par défaut (%)

/**
 * Largeur maximale autorisée pour les avatars
 * @constant {number}
 */
const MAX_WIDTH = 400; // Largeur maximale de l'avatar

/**
 * Hauteur maximale autorisée pour les avatars
 * @constant {number}
 */
const MAX_HEIGHT = 400; // Hauteur maximale de l'avatar

/**
 * Vérifie l'existence du répertoire temporaire et le crée si nécessaire
 * 
 * @async
 * @function ensureTempDir
 * @returns {Promise<void>}
 * @throws {Error} Si la création du répertoire échoue
 */
const ensureTempDir = async () => {
  try {
    await fs.access(TEMP_DIR);
  } catch (error) {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
};

/**
 * Optimise une image en redimensionnant et compressant selon les paramètres
 * 
 * @async
 * @function optimizeImage
 * @param {Buffer} buffer - Buffer contenant les données de l'image
 * @param {string} mimeType - Type MIME de l'image
 * @param {number} [quality=COMPRESSION_QUALITY] - Qualité de compression (0-100)
 * @returns {Promise<Object>} Objet contenant le buffer optimisé et les métadonnées
 * @returns {Buffer} buffer - Buffer contenant l'image optimisée
 * @returns {number} width - Largeur de l'image optimisée
 * @returns {number} height - Hauteur de l'image optimisée
 * @returns {string} format - Format de l'image optimisée
 * @throws {Error} Si l'optimisation de l'image échoue
 */
const optimizeImage = async (buffer, mimeType, quality = COMPRESSION_QUALITY) => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();


    let format = 'webp'; // Par défaut, utiliser WebP pour une meilleure compression
    let formatOptions = { quality };


    if (mimeType === 'image/png' && metadata.hasAlpha) {
      format = 'png';
      formatOptions = { compressionLevel: 9, palette: true }; // Meilleure compression pour PNG
    } else if (mimeType === 'image/gif' && metadata.pages > 1) {

      return {
        buffer,
        width: metadata.width,
        height: metadata.height,
        format: 'gif'
      };
    }


    let width = metadata.width;
    let height = metadata.height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }


    const optimizedBuffer = await image
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toFormat(format, formatOptions)
      .toBuffer();

    return {
      buffer: optimizedBuffer,
      width,
      height,
      format
    };
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'image:', error);
    throw new Error('Impossible d\'optimiser l\'image.');
  }
};

/**
 * Télécharge et enregistre un avatar utilisateur
 * Optimise l'image avant de l'enregistrer dans la base de données
 * 
 * @async
 * @function uploadAvatar
 * @param {Object} req - Objet requête Express
 * @param {Object} req.file - Fichier téléchargé via multer
 * @param {string} req.file.mimetype - Type MIME du fichier
 * @param {number} req.file.size - Taille du fichier en octets
 * @param {Buffer} req.file.buffer - Contenu du fichier
 * @param {string} req.file.originalname - Nom original du fichier
 * @param {Object} req.user - Informations de l'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<Object>} Réponse HTTP avec les détails de l'avatar
 * @throws {Error} Si le téléchargement ou le traitement de l'avatar échoue
 */
const uploadAvatar = async (req, res) => {
  try {
    await ensureTempDir();

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé.' });
    }

    const { mimetype, size, buffer, originalname } = req.file;


    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      return res.status(400).json({
        message: 'Format de fichier non pris en charge. Utilisez JPG, PNG, WebP ou GIF.'
      });
    }


    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: `La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      });
    }


    const { buffer: optimizedBuffer, width, height, format } = await optimizeImage(buffer, mimetype);


    const userId = req.user.id;


    const existingAvatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (existingAvatar) {

      existingAvatar.mime_type = `image/${format}`;
      existingAvatar.file_name = originalname;
      existingAvatar.original_size = size;
      existingAvatar.compressed_size = optimizedBuffer.length;
      existingAvatar.data = optimizedBuffer;
      existingAvatar.compression_quality = COMPRESSION_QUALITY;
      existingAvatar.dimensions = `${width}x${height}`;

      await existingAvatar.save();

      return res.status(200).json({
        message: 'Avatar mis à jour avec succès.',
        avatar: {
          id: existingAvatar.id,
          mime_type: existingAvatar.mime_type,
          dimensions: existingAvatar.dimensions,
          compressed_size: existingAvatar.compressed_size,
          original_size: existingAvatar.original_size,
          compression_ratio: Math.round((1 - existingAvatar.compressed_size / existingAvatar.original_size) * 100)
        }
      });
    } else {

      const newAvatar = await UserAvatar.create({
        user_id: userId,
        mime_type: `image/${format}`,
        file_name: originalname,
        original_size: size,
        compressed_size: optimizedBuffer.length,
        data: optimizedBuffer,
        compression_quality: COMPRESSION_QUALITY,
        dimensions: `${width}x${height}`
      });

      return res.status(201).json({
        message: 'Avatar créé avec succès.',
        avatar: {
          id: newAvatar.id,
          mime_type: newAvatar.mime_type,
          dimensions: newAvatar.dimensions,
          compressed_size: newAvatar.compressed_size,
          original_size: newAvatar.original_size,
          compression_ratio: Math.round((1 - newAvatar.compressed_size / newAvatar.original_size) * 100)
        }
      });
    }
  } catch (error) {
    console.error('Erreur d\'upload de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload de l\'avatar.' });
  }
};

/**
 * Génère un ETag pour une ressource avatar
 * 
 * @function generateETag
 * @param {Buffer} data - Données binaires de l'avatar
 * @param {string} lastModified - Date de dernière modification
 * @returns {string} ETag généré
 */
const generateETag = (data, lastModified) => {
  const hash = crypto.createHash('md5');
  hash.update(data);
  hash.update(lastModified.toString());
  return `"${hash.digest('hex')}"`;
};

/**
 * Récupère l'avatar d'un utilisateur spécifique
 * 
 * @async
 * @function getAvatar
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.userId - ID de l'utilisateur dont on veut récupérer l'avatar
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<Object>} Données binaires de l'avatar avec les en-têtes appropriés
 * @throws {Error} Si la récupération de l'avatar échoue
 */
const getAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    const avatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (!avatar) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    // Génération de l'ETag basé sur les données et la date de mise à jour
    const etag = generateETag(avatar.data, avatar.updatedAt);
    
    // Vérification du header If-None-Match pour le support du cache conditionnel
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).send(); // Not Modified
    }

    res.set('Content-Type', avatar.mime_type);
    res.set('Content-Length', avatar.compressed_size);
    res.set('Cache-Control', 'public, max-age=0, must-revalidate'); // re-télécharge l'avatar si modifié
    res.set('ETag', etag);
    return res.send(avatar.data);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * Récupère l'avatar de l'utilisateur authentifié
 * 
 * @async
 * @function getMyAvatar
 * @param {Object} req - Objet requête Express
 * @param {Object} req.user - Informations de l'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<Object>} Données binaires de l'avatar avec les en-têtes appropriés
 * @throws {Error} Si la récupération de l'avatar échoue
 */
const getMyAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const avatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (!avatar) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    // Génération de l'ETag basé sur les données et la date de mise à jour
    const etag = generateETag(avatar.data, avatar.updatedAt);
    
    // Vérification du header If-None-Match pour le support du cache conditionnel
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).send(); // Not Modified
    }

    res.set('Content-Type', avatar.mime_type);
    res.set('Content-Length', avatar.compressed_size);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache d'un jour
    res.set('ETag', etag);
    return res.send(avatar.data);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * Supprime l'avatar de l'utilisateur authentifié
 * 
 * @async
 * @function deleteAvatar
 * @param {Object} req - Objet requête Express
 * @param {Object} req.user - Informations de l'utilisateur authentifié
 * @param {number} req.user.id - ID de l'utilisateur
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<Object>} Message de confirmation de suppression
 * @throws {Error} Si la suppression de l'avatar échoue
 */
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const avatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (!avatar) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    await avatar.destroy();

    return res.status(200).json({ message: 'Avatar supprimé avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * Supprime l'avatar d'un utilisateur spécifique (probablement réservé aux administrateurs)
 * 
 * @async
 * @function deleteUserAvatar
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.userId - ID de l'utilisateur dont on veut supprimer l'avatar
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<Object>} Message de confirmation de suppression
 * @throws {Error} Si la suppression de l'avatar échoue
 */
const deleteUserAvatar = async (req, res) => {
  try {
    const userId = req.params.userId;

    const avatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (!avatar) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    await avatar.destroy();

    return res.status(200).json({ message: 'Avatar supprimé avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  uploadAvatar,
  getAvatar,
  getMyAvatar,
  deleteAvatar,
  deleteUserAvatar
};