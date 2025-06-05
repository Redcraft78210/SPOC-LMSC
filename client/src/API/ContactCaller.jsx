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

// Envoyer un message de contact
const sendContactMessage = async ({ name, email, motif, objet, message, attachments = [] }) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('motif', motif);
    formData.append('objet', objet);
    formData.append('message', message);
    
    // Ajouter les pièces jointes s'il y en a
    if (attachments && attachments.length > 0) {
      Array.from(attachments).forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post('/contact', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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

// Pour l'administration - Récupérer tous les messages de contact
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

// Pour l'administration - Récupérer un message de contact spécifique
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

// Pour l'administration - Marquer un message comme traité
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

// Pour l'administration - Supprimer un message de contact
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

// PropTypes
sendContactMessage.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  motif: PropTypes.string,
  objet: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  attachments: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.instanceOf(File)),
    PropTypes.object, // FileList
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
