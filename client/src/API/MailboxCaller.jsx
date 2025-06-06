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


const getInboxMessages = async ({ page = 1, limit = 20, filters = {} }) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    

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


const getSentMessages = async ({ page = 1, limit = 20, filters = {} }) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    

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


const getTrashMessages = async ({ page = 1, limit = 20, filters = {} }) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    

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


const sendMessage = async (formData) => {
  console.log('Sending message with formData:', formData);






  if (!(formData instanceof FormData)) {
    throw new Error('formData must be an instance of FormData');
  }


  if (!formData.has('subject') || !formData.has('content')) {
    throw new Error('formData must contain subject and content');
  }


  const hasIndividualRecipients = formData.getAll('recipients[]').length > 0;
  const hasRecipientType = formData.has('recipientType');

  if (!hasIndividualRecipients && !hasRecipientType) {
    throw new Error('formData must contain either individual recipients or a recipient type');
  }

  let endpoint = '/messages/';
  let contentType = 'multipart/form-data';

  if (formData.has('attachments') || formData.getAll('attachments').length === 0) {

    endpoint = '/messages/no-attachments';
    contentType = 'application/json';
  }

  try {

    const response = await api.post(endpoint, formData, {

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


const getAvailableRecipients = async ({ type }) => {
  try {

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
