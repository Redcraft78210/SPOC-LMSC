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

/**
 * Envoyer un avertissement à un utilisateur
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.userId - ID de l'utilisateur à avertir
 * @param {string} params.message - Message d'avertissement
 * @returns {Promise<Object>} - Réponse formatée
 */
const sendWarning = async ({ userId, message }) => {
  try {
    const response = await api.post('/moderation/warnings', { userId, message });
    return {
      status: response.status,
      data: response.data,
      message: 'Avertissement envoyé avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Signaler un contenu (thread ou commentaire)
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.itemId - ID de l'élément à signaler
 * @param {string} params.itemType - Type d'élément ('thread' ou 'comment')
 * @param {string} params.reason - Raison du signalement
 * @returns {Promise<Object>} - Réponse formatée
 */
const flagContent = async ({ itemId, itemType, reason }) => {
  try {
    const response = await api.post('/moderation/flags', { itemId, itemType, reason });
    return {
      status: response.status,
      data: response.data,
      message: 'Contenu signalé avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Récupérer tous les signalements (admin seulement)
 * @param {Object} params - Paramètres de la requête
 * @param {string} [params.status='pending'] - Statut des signalements à récupérer
 * @returns {Promise<Object>} - Réponse formatée
 */
const getFlags = async ({ status = 'pending' } = {}) => {
  try {
    const response = await api.get(`/moderation/flags?status=${status}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Signalements récupérés avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Résoudre un signalement (admin seulement)
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.flagId - ID du signalement à résoudre
 * @returns {Promise<Object>} - Réponse formatée
 */
const resolveFlag = async ({ flagId }) => {
  try {
    const response = await api.put(`/moderation/flags/${flagId}/resolve`);
    return {
      status: response.status,
      data: response.data,
      message: 'Signalement résolu avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Récupérer les avertissements d'un utilisateur
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Réponse formatée
 */
const getUserWarnings = async ({ userId }) => {
  try {
    const response = await api.get(`/moderation/warnings/user/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Avertissements récupérés avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};

sendWarning.propTypes = {
  userId: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
flagContent.propTypes = {
  itemId: PropTypes.string.isRequired,
  itemType: PropTypes.oneOf(['thread', 'comment']).isRequired,
  reason: PropTypes.string.isRequired,
};
getFlags.propTypes = {
  status: PropTypes.oneOf(['pending', 'resolved']),
};
resolveFlag.propTypes = {
  flagId: PropTypes.string.isRequired,
};
getUserWarnings.propTypes = {
  userId: PropTypes.string.isRequired,
};

export {
  sendWarning,
  flagContent,
  getFlags,
  resolveFlag,
  getUserWarnings
};