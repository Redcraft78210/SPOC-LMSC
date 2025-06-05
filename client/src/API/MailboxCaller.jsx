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
const getInboxMessages = async ({ page = 1, limit = 20, filters = {} }) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    // Add filter parameters if they are true
    if (filters.unread) queryParams.append('unread', 'true');
    if (filters.hasAttachments) queryParams.append('hasAttachments', 'true');
    if (filters.fromContact) queryParams.append('fromContact', 'true');
    
    const response = await api.get(`/messages/inbox?${queryParams.toString()}`);
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
const getSentMessages = async ({ page = 1, limit = 20, filters = {} }) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    // Add filter parameters if they are true
    if (filters.unread) queryParams.append('unread', 'true');
    if (filters.hasAttachments) queryParams.append('hasAttachments', 'true');
    if (filters.fromContact) queryParams.append('fromContact', 'true');
    
    const response = await api.get(`/messages/sent?${queryParams.toString()}`);
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
const getTrashMessages = async ({ page = 1, limit = 20, filters = {} }) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    // Add filter parameters if they are true
    if (filters.unread) queryParams.append('unread', 'true');
    if (filters.hasAttachments) queryParams.append('hasAttachments', 'true');
    if (filters.fromContact) queryParams.append('fromContact', 'true');
    
    const response = await api.get(`/messages/trash?${queryParams.toString()}`);
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
const sendMessage = async (formData) => {
  console.log('Sending message with formData:', formData);

  // formData should be an instance of FormData containing:
  // - recipients[]: Array of recipient IDs
  // - subject: String
  // - content: String
  // - attachments: Array of File objects (optional)
  if (!(formData instanceof FormData)) {
    throw new Error('formData must be an instance of FormData');
  }

  // Check required fields
  if (!formData.has('subject') || !formData.has('content')) {
    throw new Error('formData must contain subject and content');
  }

  // Check if we have recipients or a recipient type
  const hasIndividualRecipients = formData.getAll('recipients[]').length > 0;
  const hasRecipientType = formData.has('recipientType');

  if (!hasIndividualRecipients && !hasRecipientType) {
    throw new Error('formData must contain either individual recipients or a recipient type');
  }

  let endpoint = '/messages/';
  let contentType = 'multipart/form-data';

  if (formData.has('attachments') || formData.getAll('attachments').length === 0) {
    // If no attachments, use the endpoint for messages without attachments
    endpoint = '/messages/no-attachments';
    contentType = 'application/json';
  }

  try {
    // Send the FormData object directly without extracting fields
    const response = await api.post(endpoint, formData, {
      // Don't manually set Content-Type, axios will set it correctly with boundary
      headers: {
        'Content-Type': contentType,
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
