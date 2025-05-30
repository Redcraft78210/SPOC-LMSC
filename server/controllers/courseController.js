const { Course, Video, Document, Teacher, CourseVideo, CourseDocument } = require('../models');
const fs = require('fs');
const path = require('path');

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

const updateVideoCoverImages = async () => {
  try {
    const imagePath = path.join(__dirname, '../../client/public/videos/3f4b538504facde3c881b73844f52f24-1742237522/0.png');
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

//updateVideoCoverImages();

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: {
        is_published: true
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

    console.log('Courses:', JSON.stringify(courses, null, 2));

    // Transformation des données en structure imbriquée
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
}

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
}

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
}

module.exports = { getAllCourses, getCourse, getMainCourse, deleteCourse, updateCourse, createCourse };
