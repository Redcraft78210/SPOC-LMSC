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

// Récupérer le profil de l'utilisateur connecté
const getUserProfile = async () => {
  try {
    const response = await api.get('/profile/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Mettre à jour le profil utilisateur
const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/profile/', profileData);
    return {
      status: response.status,
      data: response.data,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Changer le mot de passe
const changePassword = async ({ oldPassword, newPassword }) => {
  try {
    const response = await api.put('/profile/password', { oldPassword, newPassword });
    return {
      status: response.status,
      data: response.data,
      message: 'Password changed successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Télécharger un avatar
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

// Récupérer l'avatar
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

// Supprimer l'avatar
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

// Configurer l'authentification à deux facteurs
const setup2FA = async () => {
  try {
    const response = await api.post('/users/2fa/setup');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Vérifier un code 2FA lors de la configuration
const verify2FASetup = async ({ code }) => {
  try {
    const response = await api.post('/users/2fa/verify', { code });
    return {
      status: response.status,
      data: response.data,
      message: '2FA setup verified successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Désactiver l'authentification à deux facteurs
const disable2FA = async ({ code }) => {
  try {
    const response = await api.post('/users/2fa/disable', { code });
    return {
      status: response.status,
      data: response.data,
      message: '2FA disabled successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Récupérer les préférences de notification
const getNotificationPreferences = async () => {
  try {
    const response = await api.get('/profile/notifications');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};

// Mettre à jour les préférences de notification
const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/profile/notifications', preferences);
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
    // Télécharger l'image depuis le chemin fourni avec fetch
    const imageResponse = await fetch(imagePath);
    if (!imageResponse.ok) {
      throw new Error('Erreur lors du téléchargement de l\'image');
    }
    const blob = await imageResponse.blob();
    const file = new File([blob], 'illustration.jpg', { type: blob.type || 'image/jpeg' });

    // Utiliser la fonction uploadAvatar existante
    return await uploadAvatar({ file });
  } catch (error) {
    console.error("Erreur lors du traitement de l'illustration:", error);
    return handleError(error);
  }
};

// PropTypes
getUserProfile.propTypes = {};

updateUserProfile.propTypes = {
  profileData: PropTypes.shape({
    name: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
};

changePassword.propTypes = {
  oldPassword: PropTypes.string.isRequired,
  newPassword: PropTypes.string.isRequired,
};

uploadAvatar.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string]).isRequired,
};

getAvatar.propTypes = {};

deleteAvatar.propTypes = {};

setup2FA.propTypes = {};

verify2FASetup.propTypes = {
  code: PropTypes.string.isRequired,
};

disable2FA.propTypes = {
  code: PropTypes.string.isRequired,
};

getNotificationPreferences.propTypes = {};

updateNotificationPreferences.propTypes = {
  preferences: PropTypes.object.isRequired,
};

export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  getAvatar,
  deleteAvatar,
  setup2FA,
  verify2FASetup,
  disable2FA,
  getNotificationPreferences,
  updateNotificationPreferences,
};
