import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère les erreurs retournées par les appels API
 * @private
 * @param {Error} error - L'erreur interceptée
 * @returns {Object} Objet formaté contenant les détails de l'erreur
 * @returns {number} .status - Code HTTP de l'erreur
 * @returns {Object|null} .data - Données de réponse si disponibles
 * @returns {string} .message - Message d'erreur
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
 * Récupère le profil de l'utilisateur connecté
 * @async
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Object} .data - Données du profil utilisateur
 * @returns {string} .message - Message de statut
 * @throws {Error} Erreur formatée via handleError
 */
const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
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
 * Met à jour le profil de l'utilisateur
 * @async
 * @param {Object} profileData - Données du profil à mettre à jour
 * @param {string} [profileData.name] - Prénom de l'utilisateur
 * @param {string} [profileData.surname] - Nom de famille de l'utilisateur
 * @param {string} [profileData.email] - Email de l'utilisateur
 * @param {string} [profileData.username] - Nom d'utilisateur
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Object} .data - Données mises à jour
 * @returns {string} .message - Message de confirmation
 * @throws {Error} Erreur formatée via handleError
 */
const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile/', profileData);
    return {
      status: response.status,
      data: response.data,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Télécharge un fichier image comme avatar utilisateur
 * @async
 * @param {Object} params - Paramètres de téléchargement
 * @param {File} params.file - Fichier image à télécharger
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Object} .data - Données de l'avatar téléchargé
 * @returns {string} .message - Message de confirmation
 * @throws {Error} Erreur formatée via handleError
 */
const uploadAvatar = async ({ file }) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/avatars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Avatar uploaded successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Récupère l'avatar de l'utilisateur
 * @async
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Blob} .data - Données binaires de l'image avatar
 * @returns {string} .message - Message de statut
 * @throws {Error} Erreur formatée via handleError
 */
const getAvatar = async () => {
  try {
    const response = await api.get('/avatars', {
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
 * Supprime l'avatar de l'utilisateur
 * @async
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Object} .data - Données de la réponse
 * @returns {string} .message - Message de confirmation
 * @throws {Error} Erreur formatée via handleError
 */
const deleteAvatar = async () => {
  try {
    const response = await api.delete('/avatars');
    return {
      status: response.status,
      data: response.data,
      message: 'Avatar deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Récupère les préférences de notification de l'utilisateur
 * @async
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Object} .data - Préférences de notification
 * @returns {string} .message - Message de statut
 * @throws {Error} Erreur formatée via handleError
 */
const getNotificationPreferences = async () => {
  try {
    const response = await api.get('/users/profile/notifications');
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
 * Met à jour les préférences de notification de l'utilisateur
 * @async
 * @param {Object} preferences - Nouvelles préférences de notification
 * @returns {Promise<Object>} Résultat de la requête
 * @returns {number} .status - Code HTTP de la réponse
 * @returns {Object} .data - Données mises à jour
 * @returns {string} .message - Message de confirmation
 * @throws {Error} Erreur formatée via handleError
 */
const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/users/profile/notifications', preferences);
    return {
      status: response.status,
      data: response.data,
      message: 'Notification preferences updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Télécharge une image depuis un chemin comme avatar utilisateur
 * @async
 * @param {Object} params - Paramètres de téléchargement
 * @param {string} params.imagePath - Chemin vers l'image à utiliser comme avatar
 * @returns {Promise<Object>} Résultat de la requête via uploadAvatar
 * @throws {Error} Erreur lors du téléchargement ou du traitement de l'image
 * @example
 * // Télécharger une illustration comme avatar
 * uploadIllustrationAvatar({ imagePath: '/images/default-avatar.jpg' })
 *   .then(result => console.log(result))
 *   .catch(error => console.error(error));
 */
export const uploadIllustrationAvatar = async ({ imagePath }) => {
  try {

    const imageResponse = await fetch(imagePath);
    if (!imageResponse.ok) {
      throw new Error('Erreur lors du téléchargement de l\'image');
    }
    const blob = await imageResponse.blob();
    const file = new File([blob], 'illustration.jpg', { type: blob.type || 'image/jpeg' });


    return await uploadAvatar({ file });
  } catch (error) {
    console.error("Erreur lors du traitement de l'illustration:", error);
    return handleError(error);
  }
};


getUserProfile.propTypes = {};

updateUserProfile.propTypes = {
  profileData: PropTypes.shape({
    name: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
};


uploadAvatar.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string]).isRequired,
};

getAvatar.propTypes = {};

deleteAvatar.propTypes = {};

getNotificationPreferences.propTypes = {};

updateNotificationPreferences.propTypes = {
  preferences: PropTypes.object.isRequired,
};

export {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getAvatar,
  deleteAvatar,
  getNotificationPreferences,
  updateNotificationPreferences,
};
