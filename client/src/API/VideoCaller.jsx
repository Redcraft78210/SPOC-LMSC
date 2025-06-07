import api from './api';
import PropTypes from 'prop-types';

/**
 * URL de base pour les requêtes API vidéo
 * @constant {string}
 */
const baseURL = '/api';

/**
 * Gère les erreurs d'API de manière uniforme
 * 
 * @param {Error} error - L'erreur à traiter
 * @returns {Object} Objet contenant le statut, les données et le message d'erreur formatés
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
 * Récupère toutes les données de structure vidéo disponibles
 * 
 * @async
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Envoie une vidéo au serveur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(File|string)} params.file - Fichier vidéo à envoyer
 * @param {string} params.title - Titre de la vidéo
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Récupère une vidéo spécifique par son identifiant
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.video_id - Identifiant de la vidéo à récupérer
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Récupère les informations d'une vidéo spécifique
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.video_id - Identifiant de la vidéo
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Met à jour les informations d'une vidéo existante
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.video_id - Identifiant de la vidéo à mettre à jour
 * @param {Object} params.updatedData - Nouvelles données de la vidéo
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Supprime une vidéo du système
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.video_id - Identifiant de la vidéo à supprimer
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Récupère les détails d'une vidéo (alias pour Get_Video_Information)
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.video_id - Identifiant de la vidéo
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
const getVideoDetails = async ({ video_id }) => {
  return Get_Video_Information({ video_id });
};


/**
 * Génère l'URL de streaming pour une vidéo
 * 
 * @param {(string|number)} videoId - Identifiant de la vidéo
 * @returns {string} URL complète pour le streaming de la vidéo
 */
const getVideoStreamUrl = videoId => {
  return `${baseURL}/api/video/stream/${videoId}`;
};


/**
 * Définitions des PropTypes pour les paramètres des fonctions
 */
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
