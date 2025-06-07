import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère les erreurs d'API de manière uniforme
 * 
 * @param {Error} error - L'erreur à traiter
 * @returns {Object} Objet d'erreur formaté avec status, data et message
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


/**
 * Envoie un message de contact au serveur, avec ou sans pièces jointes
 * 
 * @param {Object} params - Paramètres du message
 * @param {string} params.name - Nom de l'expéditeur
 * @param {string} params.email - Email de l'expéditeur
 * @param {string} params.motif - Motif du contact
 * @param {string} params.objet - Objet du message
 * @param {string} params.message - Contenu du message
 * @param {File[]|Object} [params.attachments=[]] - Pièces jointes (fichiers)
 * @returns {Promise<Object>} Résultat de l'opération avec status, data et message
 * @throws {Error} En cas d'échec de la requête API
 * 
 * @example
 * const result = await sendContactMessage({
 *   name: 'Jean Dupont',
 *   email: 'jean@exemple.fr',
 *   motif: 'Question',
 *   objet: 'Demande d\'information',
 *   message: 'Bonjour, je souhaiterais...',
 *   attachments: [fichier1, fichier2]
 * });
 */
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


/**
 * Récupère tous les messages de contact avec pagination
 * 
 * @param {Object} params - Paramètres de pagination
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=20] - Nombre d'éléments par page
 * @returns {Promise<Object>} Résultat de l'opération avec status, data et message
 * @throws {Error} En cas d'échec de la requête API
 * 
 * @example
 * const result = await getAllContactMessages({ page: 2, limit: 10 });
 */
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


/**
 * Récupère un message de contact spécifique par son ID
 * 
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.messageId - ID du message à récupérer
 * @returns {Promise<Object>} Résultat de l'opération avec status, data et message
 * @throws {Error} En cas d'échec de la requête API
 * 
 * @example
 * const result = await getContactMessage({ messageId: '12345' });
 */
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


/**
 * Marque un message de contact comme traité
 * 
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.messageId - ID du message à marquer comme traité
 * @returns {Promise<Object>} Résultat de l'opération avec status, data et message
 * @throws {Error} En cas d'échec de la requête API
 * 
 * @example
 * const result = await markContactMessageAsProcessed({ messageId: '12345' });
 */
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


/**
 * Supprime un message de contact
 * 
 * @param {Object} params - Paramètres de la requête
 * @param {string|number} params.messageId - ID du message à supprimer
 * @returns {Promise<Object>} Résultat de l'opération avec status, data et message
 * @throws {Error} En cas d'échec de la requête API
 * 
 * @example
 * const result = await deleteContactMessage({ messageId: '12345' });
 */
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
