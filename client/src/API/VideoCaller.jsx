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

// Récupérer toutes les vidéos
const GetAll_DataStructure = async () => {
  try {
    const response = await api.get('/video/all/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Envoyer une vidéo
const SendVideo = async ({ file, title }) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);

  try {
    const response = await api.post('/video/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Video sent successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer une vidéo spécifique
const Get_special_Video = async ({ video_id }) => {
  try {
    const response = await api.get(`/video/get/${video_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les informations d'une vidéo
const Get_Video_Information = async ({ video_id }) => {
  try {
    const response = await api.get(`/video/video-info/${video_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Mettre à jour une vidéo
const updateVideo = async ({ video_id, updatedData }) => {
  try {
    const response = await api.put(`/video/update/${video_id}/`, updatedData);
    return {
      status: response.status,
      data: response.data,
      message: 'Video updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Supprimer une vidéo
const DeleteVideo = async ({ video_id }) => {
  try {
    const response = await api.delete(`/video/delete/${video_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Video deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Alias pour Get_Video_Information
const getVideoDetails = async ({ video_id }) => {
  return Get_Video_Information({ video_id });
};

// Fonction pour générer l'URL de streaming d'une vidéo
const getVideoStreamUrl = videoId => {
  return `${baseURL}/api/video/stream/${videoId}`;
};

// PropTypes
SendVideo.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string])
    .isRequired,
  title: PropTypes.string.isRequired,
};

Get_special_Video.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

GetAll_DataStructure.propTypes = {};

Get_Video_Information.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

updateVideo.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  updatedData: PropTypes.object.isRequired,
};

DeleteVideo.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export {
  GetAll_DataStructure,
  SendVideo,
  SendVideo as uploadVideo,
  Get_special_Video,
  Get_Video_Information,
  updateVideo,
  getVideoDetails,
  getVideoStreamUrl,
  DeleteVideo,
};
