const { User, UserAvatar } = require('../models');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TEMP_DIR = path.join(__dirname, '..', 'temp');
const COMPRESSION_QUALITY = 85; // Qualité de compression par défaut (%)
const MAX_WIDTH = 400; // Largeur maximale de l'avatar
const MAX_HEIGHT = 400; // Hauteur maximale de l'avatar

// Assurez-vous que le répertoire temporaire existe
const ensureTempDir = async () => {
  try {
    await fs.access(TEMP_DIR);
  } catch (error) {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
};

// Fonction pour compresser l'image avec la meilleure qualité possible
const optimizeImage = async (buffer, mimeType, quality = COMPRESSION_QUALITY) => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Format de sortie basé sur le type MIME
    let format = 'webp'; // Par défaut, utiliser WebP pour une meilleure compression
    let formatOptions = { quality };

    // Utiliser le format d'origine si c'est préférable
    if (mimeType === 'image/png' && metadata.hasAlpha) {
      format = 'png';
      formatOptions = { compressionLevel: 9, palette: true }; // Meilleure compression pour PNG
    } else if (mimeType === 'image/gif' && metadata.pages > 1) {
      // Pour les GIF animés, on ne peut pas facilement les compresser, alors on retourne le buffer original
      return {
        buffer,
        width: metadata.width,
        height: metadata.height,
        format: 'gif'
      };
    }

    // Redimensionnement proportionnel si nécessaire
    let width = metadata.width;
    let height = metadata.height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    // Compresser l'image
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

// Upload d'un avatar
const uploadAvatar = async (req, res) => {
  try {
    await ensureTempDir();

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé.' });
    }

    const { mimetype, size, buffer, originalname } = req.file;

    // Valider le type MIME
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      return res.status(400).json({
        message: 'Format de fichier non pris en charge. Utilisez JPG, PNG, WebP ou GIF.'
      });
    }

    // Vérifier la taille du fichier
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: `La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      });
    }

    // Optimiser l'image
    const { buffer: optimizedBuffer, width, height, format } = await optimizeImage(buffer, mimetype);

    // Récupérer l'utilisateur connecté
    const userId = req.user.id;

    // Vérifier si l'utilisateur a déjà un avatar
    const existingAvatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (existingAvatar) {
      // Mettre à jour l'avatar existant
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
      // Créer un nouvel avatar
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

// Récupérer l'avatar d'un utilisateur
const getAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    const avatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (!avatar) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    res.set('Content-Type', avatar.mime_type);
    res.set('Content-Length', avatar.compressed_size);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache d'un jour
    return res.send(avatar.data);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Récupérer l'avatar de l'utilisateur connecté
const getMyAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const avatar = await UserAvatar.findOne({
      where: { user_id: userId }
    });

    if (!avatar) {
      return res.status(404).json({ message: 'Avatar non trouvé.' });
    }

    res.set('Content-Type', avatar.mime_type);
    res.set('Content-Length', avatar.compressed_size);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache d'un jour
    return res.send(avatar.data);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Supprimer l'avatar d'un utilisateur
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

// Supprimer l'avatar d'un utilisateur spécifique (admin)
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