import axios from 'axios';
import PropTypes from 'prop-types';

const createApi = authToken => {
  return axios.create({
    baseURL: 'http://localhost:8443/api/document',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// Récupérer tous les documents
const GetAll_Document = async ({ authToken }) => {
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

// Envoyer un document
const SendDocument = async ({ file, title, authToken }) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', title);

  try {
    const api = createApi(authToken);
    const response = await api.post('/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Document sent successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

// Récupérer un document spécifique
const Get_special_Document = async ({ document_id, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get(`/get/${document_id}`);
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

// Récupérer les informations d'un document
const Get_Document_Information = async ({ document_id, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get(`/document-info/${document_id}`);
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

// Mettre à jour un document
const UpdateDocument = async ({ document_id, updatedData, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.put(`/update/${document_id}/`, updatedData);
    return {
      status: response.status,
      data: response.data,
      message: 'Document updated successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

// Supprimer un document
const DeleteDocument = async ({ document_id, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.delete(`/delete/${document_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Document deleted successfully',
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
SendDocument.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string])
    .isRequired,
  title: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
};

Get_special_Document.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  authToken: PropTypes.string.isRequired,
};

GetAll_Document.propTypes = {
  authToken: PropTypes.string.isRequired,
};

Get_Document_Information.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  authToken: PropTypes.string.isRequired,
};

UpdateDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  updatedData: PropTypes.object.isRequired,
  authToken: PropTypes.string.isRequired,
};

DeleteDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  authToken: PropTypes.string.isRequired,
};

// Update the exports to include DeleteDocument
export {
  GetAll_Document,
  SendDocument as uploadDocument,
  SendDocument,
  Get_Document_Information,
  Get_special_Document,
  UpdateDocument,
  DeleteDocument, // Add this line
};
