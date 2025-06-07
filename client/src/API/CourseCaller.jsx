import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère uniformément les erreurs d'API
 * @private
 * @param {Error} error - L'erreur interceptée
 * @returns {Object} Objet normalisé contenant le statut, les données et le message d'erreur
 */
const handleError = (error) => {

  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data,
      message: error.response.data?.message || error.message,
    };
  }

  if (error.request) {
    return {
      status: 500,
      data: null,
      message: 'Aucune réponse reçue du serveur',
    };
  }

  return {
    status: 500,
    data: null,
    message: error.message,
  };
};


/**
 * Récupère tous les cours disponibles
 * @async
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Récupère un cours spécifique par son identifiant
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours à récupérer
 * @returns {Promise<Object>} Objet contenant le statut, les données du cours et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Crée un nouveau cours
 * @async
 * @param {Object} courseData - Données du cours à créer
 * @param {string} courseData.matiere - Matière du cours
 * @param {string} [courseData.chapitre] - Chapitre du cours
 * @param {string} courseData.titre - Titre du cours
 * @param {string} [courseData.description] - Description du cours
 * @param {string} [courseData.teacher_name] - Nom de l'enseignant
 * @param {string} [courseData.date_creation] - Date de création
 * @param {Array<string|number>|string} [courseData.allowed_classes] - Classes autorisées à accéder au cours
 * @returns {Promise<Object>} Objet contenant le statut, les données du cours créé et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Désapprouve/bloque un cours avec une justification
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours à désapprouver
 * @param {string} params.justification - Raison de la désapprobation
 * @returns {Promise<Object>} Objet contenant le statut, les données de réponse et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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

/**
 * Débloque un cours précédemment désapprouvé
 * @async
 * @param {string|number} courseId - Identifiant du cours à débloquer
 * @returns {Promise<Object>} Objet contenant le statut, les données de réponse et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Met à jour un cours existant
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours à mettre à jour
 * @param {Object} params.courseData - Nouvelles données du cours
 * @returns {Promise<Object>} Objet contenant le statut, les données mises à jour et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Supprime un cours existant
 * @async
 * @param {string|number} courseId - Identifiant du cours à supprimer
 * @returns {Promise<Object>} Objet contenant le statut, les données de réponse et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Récupère les détails complets d'un cours spécifique
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours
 * @returns {Promise<Object>} Objet contenant le statut, les détails du cours et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Récupère tous les cours associés à une classe spécifique
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.classId - Identifiant de la classe
 * @returns {Promise<Object>} Objet contenant le statut, la liste des cours et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Marque un cours comme terminé pour un utilisateur
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours
 * @param {string|number} params.userId - Identifiant de l'utilisateur
 * @returns {Promise<Object>} Objet contenant le statut, les données de progression et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Marque un cours comme en cours de réalisation pour un utilisateur
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours
 * @param {string|number} params.userId - Identifiant de l'utilisateur
 * @returns {Promise<Object>} Objet contenant le statut, les données de progression et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Récupère les statistiques de progression d'un étudiant
 * @async
 * @returns {Promise<Object>} Objet contenant le statut, les statistiques de progression et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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


/**
 * Récupère les informations de progression pour un cours spécifique
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.courseId - Identifiant du cours
 * @returns {Promise<Object>} Objet contenant le statut, les données de progression et un message de succès
 * @throws {Error} En cas d'échec de la requête API
 */
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
