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

// Récupérer tous les documents
const GetAll_Document = async () => {
  try {
    const response = await api.get('/document/all/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Envoyer un document
const SendDocument = async ({ file, title }) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', title);

  try {
    const response = await api.post('/document/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Document sent successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer un document spécifique
const Get_special_Document = async ({ document_id }) => {
  try {
    const response = await api.get(`/documents/${document_id}`, {
      responseType: 'blob', // This tells axios to return the data as a Blob
    });

    return {
      status: response.status,
      data: response.data, // This should now be a Blob
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les informations d'un document
const Get_Document_Information = async ({ document_id }) => {
  try {
    const response = await api.get(`/document/document-info/${document_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Mettre à jour un document
const UpdateDocument = async ({ document_id, updatedData }) => {
  try {
    const response = await api.put(`/document/update/${document_id}/`, updatedData);
    return {
      status: response.status,
      data: response.data,
      message: 'Document updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Supprimer un document
const DeleteDocument = async ({ document_id }) => {
  try {
    const response = await api.delete(`/document/delete/${document_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Document deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// PropTypes
SendDocument.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string])
    .isRequired,
  title: PropTypes.string.isRequired,
};

Get_special_Document.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

GetAll_Document.propTypes = {};

Get_Document_Information.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

UpdateDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  updatedData: PropTypes.object.isRequired,
};

DeleteDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export {
  GetAll_Document,
  SendDocument as uploadDocument,
  SendDocument,
  Get_Document_Information,
  Get_special_Document,
  UpdateDocument,
  DeleteDocument,
};
