/**
 * @fileoverview Contrôleur de gestion des cours pour l'application SPOC-LMSC.
 * Fournit des fonctionnalités CRUD pour les cours, ainsi que des opérations spécifiques
 * comme le blocage/déblocage de cours et la gestion des médias associés.
 */

const { Course, Video, Document, Teacher, CourseVideo, CourseDocument } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * Convertit une image en tableau d'octets.
 * 
 * @param {string} imagePath - Chemin vers le fichier image à convertir
 * @returns {Array<number>|null} Tableau d'octets représentant l'image ou null en cas d'échec
 */
const imageToByteArray = (imagePath) => {
  try {
    const absolutePath = path.resolve(imagePath);
    const imageBuffer = fs.readFileSync(absolutePath);
    return Array.from(imageBuffer);
  } catch (error) {
    console.error('Error converting image to byte array:', error);
    return null;
  }
};

/**
 * Met à jour les images de couverture pour les vidéos en utilisant une image par défaut.
 * 
 * @async
 * @returns {Promise<void>} - Promise qui se résout quand la mise à jour est terminée
 * @throws {Error} Si la mise à jour des images échoue
 */
const updateVideoCoverImages = async () => {
  try {
    const imagePath = path.join(__dirname, '../images/0.png');
    const imageBytes = imageToByteArray(imagePath);

    if (!imageBytes) {
      console.error('Failed to convert image to byte array. Skipping video updates.');
      return;
    }

    const videos = await Video.findAll();

    for (const video of videos) {
      await video.update({ duration: 370, cover_image: Buffer.from(imageBytes) });
      break;
    }

    console.log('Video cover images updated successfully.');
  } catch (error) {
    console.error('Error updating video cover images:', error);
  }
};

/**
 * Récupère tous les cours et les structure par professeur, matière et chapitre.
 * Filtre les résultats selon le rôle de l'utilisateur.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.user - Données de l'utilisateur authentifié
 * @param {string} req.user.role - Rôle de l'utilisateur
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne les données structurées au format JSON
 * @throws {Error} Si la récupération des cours échoue
 */
const getAllCourses = async (req, res) => {

  let userRole = req.user.role;
  let whereCondition = {is_published: true};
  if (userRole === 'Etudiant') {
    whereCondition = {
      is_published: true,
      status: 'published',
    };
  }
  try {
    const courses = await Course.findAll({
      where: {
        ...whereCondition,
      },
      include: [
        {
          model: Video,
          through: {
            model: CourseVideo,
            where: { is_main: true }
          },
          required: false
        },
        {
          model: Document,
          through: {
            model: CourseDocument,
            where: { is_main: true }
          },
          required: false
        },
        {
          model: Teacher,
          attributes: ['surname'],
          required: false
        }
      ]
    });


    const structuredData = {};

    courses.forEach(course => {
      const professor = course.Teacher ? 'Professeur ' + course.Teacher.surname : 'Unknown Professor';
      const subject = course.matiere || 'Unknown Subject';
      const topic = course.chapitre || 'Unknown Topic';

      if (!structuredData[professor]) {
        structuredData[professor] = {};
      }

      if (!structuredData[professor][subject]) {
        structuredData[professor][subject] = {};
      }

      if (!structuredData[professor][subject][topic]) {
        structuredData[professor][subject][topic] = {};
      }

      const cover_image = (course.Videos && course.Videos.length > 0 && course.Videos[0].cover_image)
        ? course.Videos[0].cover_image.toString('base64')
        : null;


      structuredData[professor][subject][topic] = {
        titre: course.title,
        description: course.description,
        date_creation: course.createdAt,
        ...(userRole !== 'Etudiant' ? { status: course.status, block_reason: course.block_reason } : {}),
        id: course.id,
        type: 'cours',
        video: course.Videos.length > 0 ? {
          id: course.Videos[0].id,
          fingerprint: course.Videos[0].fingerprint,
          duration: course.Videos[0].duration,
          cover_image,
          preview_image: course.Videos[0].preview_image,
        } : null,
        nombre_de_documents: course.Documents ? course.Documents.length : 0
      };
    });

    res.status(200).json(structuredData);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ error: 'An error occurred while fetching courses.' });
  }
};

/**
 * Récupère un cours spécifique avec ses vidéos et documents associés.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.id - ID du cours à récupérer
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne le cours au format JSON
 * @throws {Error} Si la récupération du cours échoue
 */
const getCourse = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id, {
      include: [
        { model: Video },
        { model: Document }
      ]
    });

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    res.status(200).json(cours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère un cours spécifique avec uniquement sa vidéo principale et ses documents principaux.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.id - ID du cours à récupérer
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne le cours formaté au format JSON
 * @throws {Error} Si la récupération du cours échoue
 */
const getMainCourse = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Video,
          through: {
            model: CourseVideo,
            where: { is_main: true }
          },
          required: false
        },
        {
          model: Document,
          through: {
            model: CourseDocument,
            where: { is_main: true }
          },
          required: false
        }
      ]
    });

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    const response = {
      "id": cours.id,
      "Matière": cours.matiere,
      "chapitre": cours.chapitre,
      "titre": cours.title,
      "date_creation": cours.createdAt,
      "description": cours.description,
      "status": cours.status,
      "block_reason": cours.block_reason || null,
      "video": cours.Videos.length > 0 ? {
        "video_id": cours.Videos[0].id,
        "date_mise_en_ligne": cours.Videos[0].createdAt,
        "fingerprint": cours.Videos[0].fingerprint,
      } : null,
      "documents": cours.Documents.length > 0 ? cours.Documents.map(doc => ({
        "id": doc.id,
        "title": doc.title,
        "description": doc.description || "Description du document",
        "date_mise_en_ligne": doc.createdAt,
        "fingerprint": doc.fingerprint,
      })) : []
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bloque un cours en changeant son statut et en enregistrant la raison.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.id - ID du cours à bloquer
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.block_reason - Raison du blocage
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne le cours mis à jour
 * @throws {Error} Si le blocage du cours échoue
 */
const blockCourse = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id);

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    const { block_reason } = req.body;

    await cours.update({
      status: 'blocked',
      block_reason
    });

    res.status(200).json(cours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Débloque un cours en changeant son statut à 'published'.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.id - ID du cours à débloquer
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne le cours mis à jour
 * @throws {Error} Si le déblocage du cours échoue
 */
const unblockCourse = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id);

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    await cours.update({
      status: 'published',
      block_reason: null
    });

    res.status(200).json(cours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supprime un cours de la base de données.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.id - ID du cours à supprimer
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne un message de confirmation
 * @throws {Error} Si la suppression du cours échoue
 */
const deleteCourse = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id);

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    await cours.destroy();

    res.status(200).json({ message: 'Cours deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Met à jour les informations d'un cours existant.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.params - Paramètres de la requête
 * @param {string} req.params.id - ID du cours à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.matiere] - Matière du cours
 * @param {string} [req.body.chapitre] - Chapitre du cours
 * @param {string} [req.body.titre] - Titre du cours
 * @param {string} [req.body.date_creation] - Date de création
 * @param {string} [req.body.description] - Description du cours
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne le cours mis à jour
 * @throws {Error} Si la mise à jour du cours échoue
 */
const updateCourse = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id);

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    const { matiere, chapitre, titre, date_creation, description } = req.body;

    await cours.update({
      matiere,
      chapitre,
      titre,
      date_creation,
      description
    });

    res.status(200).json(cours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crée un nouveau cours dans la base de données.
 * 
 * @async
 * @param {Object} req - Objet requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.matiere - Matière du cours
 * @param {string} req.body.chapitre - Chapitre du cours
 * @param {string} req.body.titre - Titre du cours
 * @param {string} req.body.date_creation - Date de création
 * @param {string} req.body.description - Description du cours
 * @param {Object} res - Objet réponse Express
 * @returns {Promise<void>} - Retourne le cours créé
 * @throws {Error} Si la création du cours échoue
 */
const createCourse = async (req, res) => {
  try {
    const { matiere, chapitre, titre, date_creation, description } = req.body;

    const cours = await Course.create({
      matiere,
      chapitre,
      titre,
      date_creation,
      description
    });

    res.status(201).json(cours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllCourses, getCourse, getMainCourse, deleteCourse, updateCourse, createCourse, blockCourse, unblockCourse };
