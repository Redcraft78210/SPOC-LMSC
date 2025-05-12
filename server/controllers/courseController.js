const { Course, Video, Document } = require('../models');

const getAllCours = async (req, res) => {
  try {
    const cours = await Course.findAll({
      include: [
        { model: Video, as: 'videos' },
        { model: Document, as: 'documents' }
      ]
    });

    res.status(200).json(cours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCours = async (req, res) => {
  try {
    const cours = await Course.findByPk(req.params.id, {
      include: [
        { model: Video, as: 'videos' },
        { model: Document, as: 'documents' }
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

const getCoursMain = async (req, res) => {
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

export { getAllCours, getCours, getCoursMain };