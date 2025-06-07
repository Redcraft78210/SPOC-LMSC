import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère les erreurs retournées par les appels API
 * @param {Error} error - L'erreur interceptée
 * @returns {Object} Objet formaté contenant le statut, les données et le message d'erreur
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
 * Récupère les messages de la boîte de réception avec pagination et filtres
 * @param {Object} options - Options pour la requête
 * @param {number} [options.page=1] - Numéro de page pour la pagination
 * @param {number} [options.limit=20] - Nombre de messages par page
 * @param {Object} [options.filters={}] - Filtres à appliquer aux messages
 * @param {boolean} [options.filters.unread] - Filtre pour les messages non lus
 * @param {boolean} [options.filters.hasAttachments] - Filtre pour les messages avec pièces jointes
 * @param {boolean} [options.filters.fromContact] - Filtre pour les messages de contacts
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de succès/erreur
 */
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


/**
 * Récupère les messages envoyés avec pagination et filtres
 * @param {Object} options - Options pour la requête
 * @param {number} [options.page=1] - Numéro de page pour la pagination
 * @param {number} [options.limit=20] - Nombre de messages par page
 * @param {Object} [options.filters={}] - Filtres à appliquer aux messages
 * @param {boolean} [options.filters.unread] - Filtre pour les messages non lus
 * @param {boolean} [options.filters.hasAttachments] - Filtre pour les messages avec pièces jointes
 * @param {boolean} [options.filters.fromContact] - Filtre pour les messages de contacts
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de succès/erreur
 */
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


/**
 * Récupère les messages de la corbeille avec pagination et filtres
 * @param {Object} options - Options pour la requête
 * @param {number} [options.page=1] - Numéro de page pour la pagination
 * @param {number} [options.limit=20] - Nombre de messages par page
 * @param {Object} [options.filters={}] - Filtres à appliquer aux messages
 * @param {boolean} [options.filters.unread] - Filtre pour les messages non lus
 * @param {boolean} [options.filters.hasAttachments] - Filtre pour les messages avec pièces jointes
 * @param {boolean} [options.filters.fromContact] - Filtre pour les messages de contacts
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de succès/erreur
 */
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


/**
 * Récupère un message spécifique par son identifiant
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.messageId - Identifiant du message à récupérer
 * @returns {Promise<Object>} Objet contenant le statut, les données du message et un message de succès/erreur
 */
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


/**
 * Envoie un nouveau message avec ou sans pièces jointes
 * @param {FormData} formData - Données du formulaire contenant les informations du message
 * @param {string} formData.subject - Sujet du message
 * @param {string} formData.content - Contenu du message
 * @param {Array<string|number>} [formData.recipients[]] - Liste des identifiants des destinataires individuels
 * @param {string} [formData.recipientType] - Type de destinataires (pour envoi groupé)
 * @param {File[]} [formData.attachments] - Pièces jointes du message
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de succès/erreur
 * @throws {Error} Si formData n'est pas une instance de FormData
 * @throws {Error} Si le sujet ou le contenu sont manquants
 * @throws {Error} Si aucun destinataire n'est spécifié
 */
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


/**
 * Marque un message comme lu
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.messageId - Identifiant du message à marquer comme lu
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 */
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


/**
 * Marque un message comme non lu
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.messageId - Identifiant du message à marquer comme non lu
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 */
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


/**
 * Déplace un message vers la corbeille
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.messageId - Identifiant du message à déplacer
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 */
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


/**
 * Restaure un message de la corbeille
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.messageId - Identifiant du message à restaurer
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 */
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


/**
 * Supprime définitivement un message
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.messageId - Identifiant du message à supprimer
 * @returns {Promise<Object>} Objet contenant le statut, les données et un message de confirmation
 */
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


/**
 * Télécharge une pièce jointe
 * @param {Object} options - Options pour la requête
 * @param {string|number} options.attachmentId - Identifiant de la pièce jointe à télécharger
 * @returns {Promise<Object>} Objet contenant le statut, les données binaires (blob) et un message de succès/erreur
 */
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


/**
 * Récupère la liste des destinataires disponibles
 * @param {Object} options - Options pour la requête
 * @param {string} [options.type] - Type d'utilisateurs à récupérer (filtre optionnel)
 * @returns {Promise<Object>} Objet contenant le statut, les données des destinataires et un message de succès/erreur
 */
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
