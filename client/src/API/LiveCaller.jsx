import api from './api';
import PropTypes from 'prop-types';

const baseURL = '/api';

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
}

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


const getLiveStreamUrl = (liveId) => {
  return `${baseURL}/api/stream/${liveId}`;
};


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
