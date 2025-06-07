import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère les erreurs provenant des appels API
 * @param {Error} error - L'objet d'erreur à traiter
 * @returns {Object} Objet contenant les détails de l'erreur formatés
 * @returns {number} returns.status - Code HTTP de l'erreur
 * @returns {Object|null} returns.data - Données de la réponse si disponibles
 * @returns {string} returns.message - Message d'erreur descriptif
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
 * Envoie un avertissement à un utilisateur
 * @param {Object} params - Paramètres de la fonction
 * @param {string} params.userId - Identifiant de l'utilisateur à avertir
 * @param {string} params.message - Message d'avertissement à envoyer
 * @returns {Promise<Object>} Résultat de l'opération
 * @returns {number} returns.status - Code HTTP de la réponse
 * @returns {Object} returns.data - Données retournées par le serveur
 * @returns {string} returns.message - Message descriptif du résultat
 * @example
 * // Envoyer un avertissement à un utilisateur
 * const result = await sendWarning({
 *   userId: '12345',
 *   message: 'Votre comportement enfreint nos règles communautaires.'
 * });
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
 * Signale un contenu pour modération
 * @param {Object} params - Paramètres de la fonction
 * @param {string} params.itemId - Identifiant de l'élément signalé
 * @param {('thread'|'comment')} params.itemType - Type d'élément signalé
 * @param {string} params.reason - Raison du signalement
 * @returns {Promise<Object>} Résultat de l'opération
 * @returns {number} returns.status - Code HTTP de la réponse
 * @returns {Object} returns.data - Données retournées par le serveur
 * @returns {string} returns.message - Message descriptif du résultat
 * @example
 * // Signaler un commentaire inapproprié
 * const result = await flagContent({
 *   itemId: '67890',
 *   itemType: 'comment',
 *   reason: 'Contenu offensant'
 * });
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
 * Récupère les signalements selon leur statut
 * @param {Object} [params={}] - Paramètres de la fonction
 * @param {('pending'|'resolved')} [params.status='pending'] - Statut des signalements à récupérer
 * @returns {Promise<Object>} Résultat de l'opération
 * @returns {number} returns.status - Code HTTP de la réponse
 * @returns {Object} returns.data - Données retournées par le serveur
 * @returns {string} returns.message - Message descriptif du résultat
 * @example
 * // Récupérer tous les signalements en attente
 * const pendingFlags = await getFlags();
 * 
 * // Récupérer tous les signalements résolus
 * const resolvedFlags = await getFlags({ status: 'resolved' });
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
 * Marque un signalement comme résolu
 * @param {Object} params - Paramètres de la fonction
 * @param {string} params.flagId - Identifiant du signalement à résoudre
 * @returns {Promise<Object>} Résultat de l'opération
 * @returns {number} returns.status - Code HTTP de la réponse
 * @returns {Object} returns.data - Données retournées par le serveur
 * @returns {string} returns.message - Message descriptif du résultat
 * @example
 * // Résoudre un signalement
 * const result = await resolveFlag({ flagId: '12345' });
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
 * Récupère les avertissements d'un utilisateur spécifique
 * @param {Object} params - Paramètres de la fonction
 * @param {string} params.userId - Identifiant de l'utilisateur
 * @returns {Promise<Object>} Résultat de l'opération
 * @returns {number} returns.status - Code HTTP de la réponse
 * @returns {Object} returns.data - Données retournées par le serveur
 * @returns {string} returns.message - Message descriptif du résultat
 * @example
 * // Récupérer l'historique des avertissements d'un utilisateur
 * const warnings = await getUserWarnings({ userId: '12345' });
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