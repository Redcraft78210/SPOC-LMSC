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
  baseURL: 'http://localhost:8000/api/courses',
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
    const response = await apiPython.get('/cours/');
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
    const response = await api.post('/cours/', courseData); // <- courseData ajouté ici
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

// PropTypes pour les fonctions
GetClasses.propTypes = {
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
    documents: PropTypes.array,
    allowedClasses: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
  }).isRequired,
};

export { GetClasses, GetCourses, CreateCourse };
