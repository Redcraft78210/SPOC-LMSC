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
