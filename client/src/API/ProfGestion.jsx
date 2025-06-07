import api from './api';
import PropTypes from 'prop-types';

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
