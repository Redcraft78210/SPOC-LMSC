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

// Récupérer les messages de la boîte de réception
const getInboxMessages = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await api.get(`/messages/inbox?page=${page}&limit=${limit}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les messages envoyés
const getSentMessages = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await api.get(`/messages/sent?page=${page}&limit=${limit}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les messages supprimés
const getTrashMessages = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await api.get(`/messages/trash?page=${page}&limit=${limit}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer un message spécifique
const getMessage = async ({ messageId }) => {
  try {
    const response = await api.get(`/messages/${messageId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Envoyer un nouveau message
const sendMessage = async ({ recipients, subject, content, attachments = [] }) => {
  try {
    const formData = new FormData();
    formData.append('recipients', JSON.stringify(recipients));
    formData.append('subject', subject);
    formData.append('content', content);
    
    // Ajouter les pièces jointes s'il y en a
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post('/messages/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      status: response.status,
      data: response.data,
      message: 'Message sent successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Marquer un message comme lu
const markAsRead = async ({ messageId }) => {
  try {
    const response = await api.patch(`/messages/${messageId}/read`);
    return {
      status: response.status,
      data: response.data,
      message: 'Message marked as read',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Marquer un message comme non lu
const markAsUnread = async ({ messageId }) => {
  try {
    const response = await api.patch(`/messages/${messageId}/unread`);
    return {
      status: response.status,
      data: response.data,
      message: 'Message marked as unread',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Déplacer un message vers la corbeille
const moveToTrash = async ({ messageId }) => {
  try {
    const response = await api.patch(`/messages/${messageId}/trash`);
    return {
      status: response.status,
      data: response.data,
      message: 'Message moved to trash',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Restaurer un message de la corbeille
const restoreFromTrash = async ({ messageId }) => {
  try {
    const response = await api.patch(`/messages/${messageId}/restore`);
    return {
      status: response.status,
      data: response.data,
      message: 'Message restored from trash',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Supprimer définitivement un message
const deleteMessage = async ({ messageId }) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Message permanently deleted',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Télécharger une pièce jointe
const downloadAttachment = async ({ attachmentId }) => {
  try {
    const response = await api.get(`/messages/attachments/${attachmentId}`, {
      responseType: 'blob',
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les destinataires disponibles pour l'envoi de messages
const getAvailableRecipients = async ({ type }) => {
  try {
    // type can be: 'individual', 'all-students', 'all-teachers', 'all-admins'
    const response = await api.get(`/users`, {
      params: type ? { type } : {},
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// PropTypes
getInboxMessages.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
};

getSentMessages.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
};

getTrashMessages.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
};

getMessage.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

sendMessage.propTypes = {
  recipients: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  subject: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  attachments: PropTypes.arrayOf(PropTypes.instanceOf(File)),
};

markAsRead.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

markAsUnread.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

moveToTrash.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

restoreFromTrash.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

deleteMessage.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

downloadAttachment.propTypes = {
  attachmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getAvailableRecipients.propTypes = {
  type: PropTypes.string,
};

export {
  getInboxMessages,
  getSentMessages,
  getTrashMessages,
  getMessage,
  sendMessage,
  markAsRead,
  markAsUnread,
  moveToTrash,
  restoreFromTrash,
  deleteMessage,
  downloadAttachment,
  getAvailableRecipients,
};
