import axios from 'axios';
import PropTypes from 'prop-types';

const createApi = authToken => {
  return axios.create({
    baseURL: 'http://localhost:8443/api',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
};

const GetClasses = async ({ authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get('/classes/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const GetCourses = async ({ authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get('/all/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const CreateCourse = async ({ courseData, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.post('/create/', courseData);
    return {
      status: response.status,
      data: response.data,
      message: 'Course created successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const UpdateCourse = async ({ courseId, courseData, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.put(`/cours/${courseId}/`, courseData);
    return {
      status: response.status,
      data: response.data,
      message: 'Course updated successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const GetCourseDetails = async ({ courseId, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get(`/cours/${courseId}/`);
    return {
      status: response.status,
      data: response.data,
      message: 'Course details retrieved successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const DeleteCourse = async ({ courseId, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.delete(`/delete/${courseId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Course deleted successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

// PropTypes
GetClasses.propTypes = {
  authToken: PropTypes.string.isRequired,
};

GetCourses.propTypes = {
  authToken: PropTypes.string.isRequired,
};

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
  authToken: PropTypes.string.isRequired,
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
  authToken: PropTypes.string.isRequired,
};

GetCourseDetails.propTypes = {
  courseId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
};

DeleteCourse.propTypes = {
  courseId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
};

export {
  GetClasses,
  GetCourses,
  CreateCourse,
  UpdateCourse,
  GetCourseDetails,
  DeleteCourse,
};
