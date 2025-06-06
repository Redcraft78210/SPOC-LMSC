import api from './api';
import PropTypes from 'prop-types';

/**
 * Fonction générique de gestion des erreurs
 * @param {Error} error - L'erreur à traiter
 * @returns {Object} - Objet d'erreur formaté
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
