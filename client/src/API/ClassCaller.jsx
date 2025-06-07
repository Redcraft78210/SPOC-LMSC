import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère de manière standardisée les erreurs des requêtes API
 * 
 * @param {Error} error - L'erreur à traiter
 * @returns {Object} Objet contenant le statut, les données et le message d'erreur formatés
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
 * Récupère toutes les classes disponibles
 * 
 * @async
 * @returns {Promise<Object>} Objet contenant le statut, les données des classes et un message
 * @throws {Error} Erreur gérée par handleError
 * 
 * @example
 * const response = await getAllClasses();
 * if (response.status === 200) {
 *   const classes = response.data;
 * }
 */
const getAllClasses = async () => {
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


/**
 * Récupère une classe par son identifiant
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe à récupérer
 * @returns {Promise<Object>} Objet contenant le statut, les données de la classe et un message
 * @throws {Error} Erreur gérée par handleError
 * 
 * @example
 * const response = await getClassById({ classId: '123' });
 */
const getClassById = async ({ classId }) => {
  try {
    const response = await api.get(`/classes/${classId}`);
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
 * Crée une nouvelle classe
 * 
 * @async
 * @param {Object} classData - Données de la classe à créer
 * @param {string} classData.name - Nom de la classe
 * @param {string} [classData.description] - Description de la classe
 * @param {string|number} [classData.main_teacher_id] - Identifiant de l'enseignant principal
 * @param {Array<string|number>} [classData.students] - Liste des identifiants des étudiants
 * @returns {Promise<Object>} Objet contenant le statut, les données de la classe créée et un message
 * @throws {Error} Erreur gérée par handleError
 */
const createClass = async (classData) => {
  try {
    const response = await api.post('/classes/', classData);
    return {
      status: response.status,
      data: response.data,
      message: 'Class created successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Met à jour une classe existante
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe à mettre à jour
 * @param {Object} params.classData - Nouvelles données de la classe
 * @returns {Promise<Object>} Objet contenant le statut, les données mises à jour et un message
 * @throws {Error} Erreur gérée par handleError
 */
const updateClass = async ({ classId, classData }) => {
  try {
    const response = await api.put(`/classes/${classId}`, classData);
    return {
      status: response.status,
      data: response.data,
      message: 'Class updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Supprime une classe
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe à supprimer
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 * @throws {Error} Erreur gérée par handleError
 */
const deleteClass = async ({ classId }) => {
  try {
    const response = await api.delete(`/classes/${classId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Class deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Ajoute un étudiant à une classe
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe
 * @param {string|number} params.studentId - Identifiant de l'étudiant à ajouter
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 * @throws {Error} Erreur gérée par handleError
 */
const addStudentToClass = async ({ classId, studentId }) => {
  try {
    const response = await api.post(`/classes/${classId}/students`, { studentId });
    return {
      status: response.status,
      data: response.data,
      message: 'Student added to class successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Retire un étudiant d'une classe
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe
 * @param {string|number} params.studentId - Identifiant de l'étudiant à retirer
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 * @throws {Error} Erreur gérée par handleError
 */
const removeStudentFromClass = async ({ classId, studentId }) => {
  try {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Student removed from class successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Récupère la liste des étudiants d'une classe
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe
 * @returns {Promise<Object>} Objet contenant le statut, les données des étudiants et un message
 * @throws {Error} Erreur gérée par handleError
 */
const getClassStudents = async ({ classId }) => {
  try {
    const response = await api.get(`/classes/${classId}/students`);
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
 * Définit l'enseignant principal d'une classe
 * 
 * @async
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.classId - Identifiant de la classe
 * @param {string|number} params.teacherId - Identifiant de l'enseignant à définir comme principal
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 * @throws {Error} Erreur gérée par handleError
 */
const setMainTeacher = async ({ classId, teacherId }) => {
  try {
    const response = await api.put(`/classes/${classId}/main-teacher`, { teacherId });
    return {
      status: response.status,
      data: response.data,
      message: 'Main teacher updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


getAllClasses.propTypes = {};

getClassById.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

createClass.propTypes = {
  classData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    main_teacher_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    students: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  }).isRequired,
};

updateClass.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  classData: PropTypes.object.isRequired,
};

deleteClass.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

addStudentToClass.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

removeStudentFromClass.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getClassStudents.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

setMainTeacher.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  teacherId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getClassStudents,
  setMainTeacher,
};
