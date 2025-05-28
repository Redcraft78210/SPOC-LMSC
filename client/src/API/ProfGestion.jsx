import api from './api';
import PropTypes from 'prop-types';

/**
 * Fonction générique de gestion des erreurs
 * @param {Error} error - L'erreur à traiter
 * @returns {Object} - Objet d'erreur formaté
 */
const handleError = (error) => {
  // Si l'API a répondu avec une erreur
  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data,
      message: error.response.data?.message || error.message,
    };
  }
  // Si l'erreur est liée à la configuration de la requête
  if (error.request) {
    return {
      status: 500,
      data: null,
      message: 'Aucune réponse reçue du serveur',
    };
  }
  // Pour les autres types d'erreurs
  return {
    status: 500,
    data: null,
    message: error.message,
  };
};

// Récupérer toutes les classes
const GetClasses = async () => {
  try {
    const response = await api.get('/classes/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer tous les cours
const GetCourses = async () => {
  try {
    const response = await api.get('/all/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Créer un cours
const CreateCourse = async ({ courseData }) => {
  try {
    const response = await api.post('/create/', courseData);
    return {
      status: response.status,
      data: response.data,
      message: 'Course created successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Mettre à jour un cours
const UpdateCourse = async ({ courseId, courseData }) => {
  try {
    const response = await api.put(`/cours/${courseId}/`, courseData);
    return {
      status: response.status,
      data: response.data,
      message: 'Course updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Détails d'un cours
const GetCourseDetails = async ({ courseId }) => {
  try {
    const response = await api.get(`/cours/${courseId}/`);
    return {
      status: response.status,
      data: response.data,
      message: 'Course details retrieved successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Supprimer un cours
const DeleteCourse = async ({ courseId }) => {
  try {
    const response = await api.delete(`/delete/${courseId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Course deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// PropTypes
GetClasses.propTypes = {};

GetCourses.propTypes = {};

CreateCourse.propTypes = {
  courseData: PropTypes.shape({
    Matière: PropTypes.string.isRequired,
    chapitre: PropTypes.string,
    titre: PropTypes.string.isRequired,
    date_creation: PropTypes.string.isRequired,
    description: PropTypes.string,
    ID_cours: PropTypes.string.isRequired,
    video: PropTypes.any,
    documents: PropTypes.arrayOf(PropTypes.string),
    allowedClasses: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
  }).isRequired,
};

UpdateCourse.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseData: PropTypes.shape({
    Matière: PropTypes.string.isRequired,
    chapitre: PropTypes.string,
    titre: PropTypes.string.isRequired,
    date_creation: PropTypes.string.isRequired,
    description: PropTypes.string,
    ID_cours: PropTypes.string.isRequired,
    video: PropTypes.any,
    documents: PropTypes.arrayOf(PropTypes.string),
    allowedClasses: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
  }).isRequired,
};

GetCourseDetails.propTypes = {
  courseId: PropTypes.string.isRequired,
};

DeleteCourse.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export {
  GetClasses,
  GetCourses,
  CreateCourse,
  UpdateCourse,
  GetCourseDetails,
  DeleteCourse,
};
