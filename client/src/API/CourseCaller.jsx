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

// Récupérer tous les cours
const getAllCourses = async () => {
  try {
    const response = await api.get('/courses/all');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer un cours spécifique
const getCourseById = async ({ courseId }) => {
  try {
    const response = await api.get(`/courses/${courseId}/main`);
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
const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses/', courseData);
    return {
      status: response.status,
      data: response.data,
      message: 'Course created successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Désapprouver un cours
const disapproveCourse = async ({ courseId, justification }) => {
  try {
    const response = await api.post(`/courses/${courseId}/block`,
      { block_reason: justification }
    );
    return {
      status: response.status,
      data: response.data,
      message: 'Course disapproved successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

const unblockCourse = async (courseId) => {
  try {
    const response = await api.put(`/courses/${courseId}/unblock`);
    return {
      status: response.status,
      data: response.data,
      message: 'Course unblocked successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Mettre à jour un cours
const updateCourse = async ({ courseId, courseData }) => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return {
      status: response.status,
      data: response.data,
      message: 'Course updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Supprimer un cours
const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Course deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les détails complets d'un cours (avec vidéos et documents)
const getCourseDetails = async ({ courseId }) => {
  try {
    const response = await api.get(`/courses/${courseId}/details`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les cours d'une classe spécifique
const getCoursesByClass = async ({ classId }) => {
  try {
    const response = await api.get(`/courses/class/${classId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Marquer un cours comme terminé
const markCourseAsCompleted = async ({ courseId, userId }) => {
  try {
    const response = await api.post(`/progress/course-progress/${courseId}`, {
      status: 'completed',
      userId,
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Course marked as completed',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Marquer un cours comme en cours
const markCourseAsInProgress = async ({ courseId, userId }) => {
  try {
    const response = await api.post(`/progress/course-progress/${courseId}`, {
      status: 'in_progress',
      userId,
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Course marked as in progress',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les statistiques de progression d'un étudiant
const getStudentProgress = async () => {
  try {
    const response = await api.get(`/progress/stats`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer la progression du cours pour l'utilisateur connecté
const getCourseProgress = async ({ courseId }) => {
  try {
    const response = await api.get(`/progress/course-progress/${courseId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// PropTypes
getAllCourses.propTypes = {};

getCourseById.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

disapproveCourse.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  justification: PropTypes.string.isRequired,
};

unblockCourse.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

createCourse.propTypes = {
  courseData: PropTypes.shape({
    matiere: PropTypes.string.isRequired,
    chapitre: PropTypes.string,
    titre: PropTypes.string.isRequired,
    description: PropTypes.string,
    teacher_name: PropTypes.string,
    date_creation: PropTypes.string,
    allowed_classes: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
      PropTypes.string,
    ]),
  }).isRequired,
};

updateCourse.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  courseData: PropTypes.object.isRequired,
};

deleteCourse.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getCourseDetails.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getCoursesByClass.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

markCourseAsCompleted.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

markCourseAsInProgress.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

getStudentProgress.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getCourseProgress.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export {
  getAllCourses,
  getCourseById,
  disapproveCourse,
  unblockCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseDetails,
  getCoursesByClass,
  markCourseAsCompleted,
  markCourseAsInProgress,
  getStudentProgress,
  getCourseProgress,
};
