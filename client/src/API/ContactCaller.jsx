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


const sendContactMessage = async ({ name, email, motif, objet, message, attachments = [] }) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('motif', motif);
    formData.append('objet', objet);
    formData.append('message', message);
    

    if (attachments && attachments.length > 0) {
      Array.from(attachments).forEach(file => {
        formData.append('attachments', file);
      });
    }

    const endpoint = attachments.length > 0 ? '/messages/contact' : '/messages/contact/no-attachments';
    const contentType = attachments.length > 0 ? 'multipart/form-data' : 'application/json';

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': contentType,
      },
    });
    
    return {
      status: response.status,
      data: response.data,
      message: 'Contact message sent successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const getAllContactMessages = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await api.get(`/admin/contact-messages?page=${page}&limit=${limit}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};


const getContactMessage = async ({ messageId }) => {
  try {
    const response = await api.get(`/admin/contact-messages/${messageId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};


const markContactMessageAsProcessed = async ({ messageId }) => {
  try {
    const response = await api.patch(`/admin/contact-messages/${messageId}/processed`);
    return {
      status: response.status,
      data: response.data,
      message: 'Message marked as processed',
    };
  } catch (error) {
    return handleError(error);
  }
};


const deleteContactMessage = async ({ messageId }) => {
  try {
    const response = await api.delete(`/admin/contact-messages/${messageId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Contact message deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


sendContactMessage.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  motif: PropTypes.string,
  objet: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  attachments: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.instanceOf(File)),
    PropTypes.object,
  ]),
};

getAllContactMessages.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
};

getContactMessage.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

markContactMessageAsProcessed.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

deleteContactMessage.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export {
  sendContactMessage,
  getAllContactMessages,
  getContactMessage,
  markContactMessageAsProcessed,
  deleteContactMessage,
};
