const { Course, Video, Document } = require('../models');

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: Video },
        { model: Document }
      ]
    });

    // Transformation des données en structure imbriquée
    const structuredData = {};

    courses.forEach(course => {
      const professor = course.professor || 'Unknown Professor';
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

      structuredData[professor][subject][topic] = {
        titre: course.titre,
        description: course.description,
        date_creation: course.createdAt,
        id: course.id,
        type: 'cours',
        video: course.Video ? {
          video_id: course.Video.id,
          date_mise_en_ligne: `/media/video/${course.Video.path.split('/').pop()}`
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
    const cours = await Course.findByPk(req.params.id);

    if (!cours) {
      return res.status(404).json({ error: 'Cours not found' });
    }

    const mainVideo = await Video.findOne({
      where: { coursId: cours.id, is_main: true }
    });

    const mainDocuments = await Document.findAll({
      where: { coursId: cours.id, is_main: true }
    });

    const response = {
      "Matière": cours.matiere,
      "chapitre": cours.chapitre,
      "titre": cours.titre,
      "date_creation": cours.date_creation,
      "description": cours.description,
      "Date de création": cours.date_creation,
      "ID_cours": `cours_${cours.id}`,
      "video": mainVideo ? {
        "video_id": mainVideo.id,
        "date_mise_en_ligne": `/media/video/${mainVideo.path.split('/').pop()}`
      } : null,
      "documents": mainDocuments.map(doc => ({
        "id": `doc_${doc.id}`,
        "title": doc.commit_msg,
        "description": "Description du document",
        "date_mise_en_ligne": `/media/documents/${doc.path.split('/').pop()}`
      }))
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