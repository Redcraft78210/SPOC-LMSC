import api from './api';
import PropTypes from 'prop-types';

const baseURL = 'https://localhost:8443/api';

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

// Récupérer tous les lives disponibles
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

// Récupérer les lives d'une classe spécifique
const getLivesByClass = async ({ classId }) => {
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

// Récupérer un live spécifique
const getLiveById = async ({ liveId }) => {
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

// Créer un nouveau live
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

// Mettre à jour un live
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

// Supprimer un live
const deleteLive = async ({ liveId }) => {
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

// Démarrer un live
const startLive = async ({ liveId }) => {
  try {
    const response = await api.post(`/lives/${liveId}/start`);
    return {
      status: response.status,
      data: response.data,
      message: 'Live started successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Terminer un live
const endLive = async ({ liveId }) => {
  try {
    const response = await api.post(`/lives/${liveId}/end`);
    return {
      status: response.status,
      data: response.data,
      message: 'Live ended successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les messages du chat d'un live
const getLiveMessages = async ({ liveId }) => {
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

// Envoyer un message dans le chat d'un live
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

// Générer l'URL de streaming d'un live
const getLiveStreamUrl = (liveId) => {
  return `${baseURL}/api/stream/${liveId}`;
};

// Log view engagement (mark attendance or update engagement time)
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

// PropTypes
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
};
