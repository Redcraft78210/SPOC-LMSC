import axios from 'axios';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://localhost:8443/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const apiPython = axios.create({
  baseURL: 'http://localhost:8000/cours/',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': Cookies.get('csrftoken'),
  },
  withCredentials: true,
});

const GetClasses = async authToken => {
  try {
    const response = await api.get('/classes/', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return { status: 200, data: response.data };
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('API server not found.', error.response);
    } else if (error.response?.status === 400) {
      console.error('Erreur API :', error.response?.status, error.message);
    }
    console.error(error);
  }
  return null;
};

const GetCourses = async () => {
  try {
    const response = await apiPython.get('all/');
    return { status: 200, data: response.data };
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Cours non trouvés.', error.response);
    } else if (error.response?.status === 400) {
      console.error('Erreur API :', error.response?.status, error.message);
    }
    console.error(error);
  }
  return null;
};

const CreateCourse = async courseData => {
  try {
    const response = await apiPython.post('create/', courseData);
    return { status: 201, data: response.data };
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Données invalides :', error.response?.data);
    } else {
      console.error('Erreur API :', error.message);
    }
    console.error(error); 
  }
  return null;
};

const UpdateCourse = async (courseId, courseData) => {
  try {
    const response = await apiPython.put(`/cours/${courseId}/`, courseData, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`, // Remplacez par votre méthode d'authentification
      },
    });
    return { status: 200, data: response.data };
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Données invalides :', error.response?.data);
    } else if (error.response?.status === 404) {
      console.error('Cours non trouvé :', error.response?.data);
    } else {
      console.error('Erreur API :', error.message);
    }
    console.error(error);
  }
  return null;
};

const GetCourseDetails = async (authToken, courseId) => {
  try {
    const response = await api.get(`/cours/${courseId}/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return { status: 200, data: response.data };
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Cours non trouvé :', error.response?.data);
    } else if (error.response?.status === 400) {
      console.error('Erreur API :', error.response?.data);
    } else {
      console.error('Erreur API :', error.message);
    }
    console.error(error);
  }
  return null;
};

// PropTypes pour les fonctions
GetClasses.propTypes = {
  authToken: PropTypes.string.isRequired,
};

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
  authToken: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

export { GetClasses, GetCourses, CreateCourse, UpdateCourse, GetCourseDetails };
