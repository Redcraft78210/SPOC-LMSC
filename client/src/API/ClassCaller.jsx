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

// Récupérer une classe spécifique
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

// Créer une classe
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

// Mettre à jour une classe
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

// Supprimer une classe
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

// Ajouter un étudiant à une classe
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

// Retirer un étudiant d'une classe
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

// Récupérer les étudiants d'une classe
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

// Changer le professeur principal d'une classe
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

// PropTypes
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
