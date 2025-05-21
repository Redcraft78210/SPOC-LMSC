import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

const api = axios.create({
  baseURL: 'https://192.168.36.10:443/api/document',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': Cookies.get('csrftoken'),
  },
  withCredentials: true,
});

// Récupérer tous les documents
const GetAll_Document = async () => {
  try {
    const response = await api.get('/all/');
    if (response.status === 200) {
      return response.data;
    }
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

// Envoyer un document
const SendDocument = async ({ file, title }) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', title);

  try {
    const request = await api.post('/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (request.status === 200) {
      return {
        status: 200,
        message: 'Document envoyé avec succès, vous pouvez actualiser.',
      };
    }
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

// Récupérer un document spécifique
const Get_special_Document = async ({ document_id }) => {
  try {
    const response = await api.get(`/get/${document_id}`);
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

// Récupérer les informations d'un document
const Get_Document_Information = async (document_id) => {
  try {
    const response = await api.get(`/document-info/${document_id}`);
    return { status: 200, data: response.data };
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('API server not found.', error.response);
    } else if (error.response?.status === 400) {
      console.error('Erreur API :', error.response?.status, error.message);
    }
    console.error(error);
  }
};

// Mettre à jour un document
const UpdateDocument = async ({ document_id, updatedData }) => {
  try {
    const response = await api.put(`/update/${document_id}/`, updatedData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('API server not found.', error.response);
    } else if (error.response?.status === 400) {
      console.error('Erreur API :', error.response?.status, error.message);
    }
    console.error(error);
  }
};

SendDocument.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string])
    .isRequired,
  title: PropTypes.string.isRequired,
};

Get_special_Document.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

UpdateDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  updatedData: PropTypes.object.isRequired,
};

export {
  GetAll_Document,
  SendDocument,
  Get_Document_Information,
  UpdateDocument,
};
