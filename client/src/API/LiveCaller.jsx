import api from './api';
import PropTypes from 'prop-types';

const baseURL = '/api';

/**
 * Gère les erreurs d'API de manière uniforme
 * 
 * @param {Error} error - L'erreur à traiter
 * @returns {Object} Objet formaté contenant le statut, les données et le message d'erreur
 * @private
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
 * Récupère toutes les diffusions en direct
 * 
 * @async
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 * @example
 * const { status, data, message } = await getAllLives();
 */
const getAllLives = async () => {
  try {
    const response = await api.get('/lives/all');
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
 * Récupère les diffusions en direct associées à une classe spécifique
 * 
 * @async
 * @param {string|number} classId - L'identifiant de la classe
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const getLivesByClass = async (classId) => {
  try {
    const response = await api.get(`/lives/class/${classId}`);
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
 * Récupère une diffusion en direct par son identifiant
 * 
 * @async
 * @param {string|number} liveId - L'identifiant de la diffusion en direct
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const getLiveById = async (liveId) => {
  try {
    const response = await api.get(`/lives/${liveId}`);
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
 * Crée une nouvelle diffusion en direct
 * 
 * @async
 * @param {Object} liveData - Les données de la diffusion en direct à créer
 * @param {string} liveData.titre - Le titre de la diffusion
 * @param {string} [liveData.description] - La description de la diffusion
 * @param {string} liveData.matiere - La matière concernée
 * @param {boolean} [liveData.chat_enabled] - Si le chat est activé
 * @param {boolean} [liveData.est_programe] - Si la diffusion est programmée
 * @param {string} [liveData.date_heure_lancement] - Date et heure de lancement programmé
 * @param {Array<string|number>|string} liveData.allowed_classes - Classes autorisées à suivre la diffusion
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const createLive = async (liveData) => {
  try {
    const response = await api.post('/lives/', liveData);
    return {
      status: response.status,
      data: response.data,
      message: 'Live created successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Met à jour une diffusion en direct existante
 * 
 * @async
 * @param {Object} params - Paramètres de mise à jour
 * @param {string|number} params.liveId - L'identifiant de la diffusion à mettre à jour
 * @param {Object} params.liveData - Les nouvelles données pour la diffusion
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const updateLive = async ({ liveId, liveData }) => {
  try {
    const response = await api.put(`/lives/${liveId}`, liveData);
    return {
      status: response.status,
      data: response.data,
      message: 'Live updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Supprime une diffusion en direct
 * 
 * @async
 * @param {string|number} liveId - L'identifiant de la diffusion à supprimer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const deleteLive = async (liveId) => {
  try {
    const response = await api.delete(`/lives/${liveId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Live deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Démarre une diffusion en direct
 * 
 * @async
 * @param {string|number} liveId - L'identifiant de la diffusion à démarrer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const startLive = async (liveId) => {
  try {
    const response = await api.patch(`/lives/${liveId}/start`);
    return {
      status: response.status,
      data: response.data,
      message: 'Live started successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Termine une diffusion en direct
 * 
 * @async
 * @param {string|number} liveId - L'identifiant de la diffusion à terminer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const endLive = async (liveId) => {
  try {
    const response = await api.patch(`/lives/${liveId}/end`);
    return {
      status: response.status,
      data: response.data,
      message: 'Live ended successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Désapprouve une diffusion en direct
 * 
 * @async
 * @param {Object} params - Paramètres de désapprobation
 * @param {string|number} params.liveId - L'identifiant de la diffusion à désapprouver
 * @param {string} params.justification - La justification de la désapprobation
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const disapproveLive = async ({ liveId, justification }) => {
  try {
    const response = await api.patch(`/lives/${liveId}/disapprove`, { justification });
    return {
      status: response.status,
      data: response.data,
      message: 'Live disapproved successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Bloque une diffusion en direct
 * 
 * @async
 * @param {Object} params - Paramètres de blocage
 * @param {string|number} params.liveId - L'identifiant de la diffusion à bloquer
 * @param {string} params.reason - La raison du blocage
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const blockLive = async ({ liveId, reason }) => {
  try {
    const response = await api.patch(`/lives/${liveId}/block`, { justification: reason });
    return {
      status: response.status,
      data: response.data,
      message: 'Live blocked successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Débloque une diffusion en direct
 * 
 * @async
 * @param {string|number} liveId - L'identifiant de la diffusion à débloquer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const unblockLive = async (liveId) => {
  try {
    const response = await api.patch(`/lives/${liveId}/unblock`);
    return {
      status: response.status,
      data: response.data,
      message: 'Live unblocked successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Récupère les messages du chat d'une diffusion en direct
 * 
 * @async
 * @param {string|number} liveId - L'identifiant de la diffusion
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const getLiveMessages = async (liveId) => {
  try {
    const response = await api.get(`/${liveId}/chat`);
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
 * Envoie un message dans le chat d'une diffusion en direct
 * 
 * @async
 * @param {Object} params - Paramètres d'envoi
 * @param {string|number} params.liveId - L'identifiant de la diffusion
 * @param {string} params.message - Le contenu du message à envoyer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const sendLiveMessage = async ({ liveId, message }) => {
  try {
    const response = await api.post(`/${liveId}/chat`, { message });
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
 * Génère l'URL de streaming d'une diffusion en direct
 * 
 * @param {string|number} liveId - L'identifiant de la diffusion
 * @returns {string} L'URL de streaming complète
 */
const getLiveStreamUrl = (liveId) => {
  return `${baseURL}/api/stream/${liveId}`;
};


/**
 * Enregistre l'engagement d'un utilisateur sur une diffusion en direct
 * 
 * @async
 * @param {Object} params - Paramètres d'engagement
 * @param {string|number} params.streamId - L'identifiant de la diffusion
 * @param {number} params.activeViewTime - Le temps de visionnage actif en secondes
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreur traitée par handleError en cas d'échec de la requête
 */
const logViewEngagement = async ({ streamId, activeViewTime }) => {
  try {
    const response = await api.post('/attendance', {
      liveId: streamId,
      activeViewTime,
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Engagement logged successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


getAllLives.propTypes = {};

getLivesByClass.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getLiveById.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

createLive.propTypes = {
  liveData: PropTypes.shape({
    titre: PropTypes.string.isRequired,
    description: PropTypes.string,
    matiere: PropTypes.string.isRequired,
    chat_enabled: PropTypes.bool,
    est_programe: PropTypes.bool,
    date_heure_lancement: PropTypes.string,
    allowed_classes: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
      PropTypes.string,
    ]).isRequired,
  }).isRequired,
};

updateLive.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  liveData: PropTypes.object.isRequired,
};

deleteLive.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

startLive.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

endLive.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

getLiveMessages.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

sendLiveMessage.propTypes = {
  liveId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.string.isRequired,
};

export {
  getAllLives,
  getLivesByClass,
  getLiveById,
  createLive,
  updateLive,
  deleteLive,
  startLive,
  endLive,
  getLiveMessages,
  sendLiveMessage,
  getLiveStreamUrl,
  logViewEngagement,
  disapproveLive,
  blockLive,
  unblockLive,
};
