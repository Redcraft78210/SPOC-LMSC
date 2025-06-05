/**
 * Module de gestion des appels API liés à l'authentification
 */
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

/**
 * Vérifier la validité d'un code d'inscription
 * @param {Object} params - Les paramètres
 * @param {string} params.code - Le code d'inscription à vérifier
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const checkRegisterCode = async ({ code }) => {
  try {
    const response = await api.post('/auth/check-register-code', { code });
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
 * S'inscrire sur la plateforme
 * @param {Object} userData - Les données d'inscription
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
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
 * Se connecter à la plateforme
 * @param {Object} credentials - Les identifiants
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
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
 * Vérifier un code 2FA
 * @param {Object} params - Les paramètres
 * @param {string} params.tempToken - Le token temporaire
 * @param {string} params.code - Le code 2FA
 * @param {boolean} params.setup - Indique s'il s'agit d'une configuration initiale
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const verifyTwoFA = async ({ tempToken, code, setup }) => {
  try {
    const response = await api.post('/auth/verify-2fa', { tempToken, code, setup });
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
 * Rafraîchir la configuration 2FA
 * @param {Object} params - Les paramètres
 * @param {string} params.tempToken - Le token temporaire
 * @param {Object} params.twoFASetup - Les données de configuration 2FA
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const refreshTwoFASetup = async ({ tempToken, twoFASetup }) => {
  try {
    const response = await api.post('/auth/refresh-2fa-setup', { tempToken, twoFASetup });
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
 * Demander la réinitialisation du mot de passe
 * @param {Object} params - Les paramètres
 * @param {string} params.email - L'email de l'utilisateur
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const forgotPassword = async ({ email }) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
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
 * Effectuer la première connexion d'un utilisateur
 * @param {Object} params - Les paramètres
 * @param {string} params.username - Le nom d'utilisateur
 * @param {string} params.password - Le mot de passe
 * @param {string} params.token - Le token d'authentification
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const firstLogin = async ({ username, password, token }) => {
  try {
    const response = await api.post('/auth/first-login', 
      { username, password },
      { headers: { Authorization: `Bearer ${token}` }}
    );
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
 * Vérifier si la 2FA est activée pour un utilisateur
 * @param {Object} params - Les paramètres
 * @param {string} params.token - Le token d'authentification
 * @returns {Promise<Object>} - La réponse du serveur
 */
export const check2FAStatus = async ({ token }) => {
  try {
    const response = await api.get('/users/2fa', {
      headers: { Authorization: `Bearer ${token}` }
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

// PropTypes
checkRegisterCode.propTypes = {
  code: PropTypes.string.isRequired,
};

register.propTypes = {
  userData: PropTypes.shape({
    email: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
    registerCode: PropTypes.string.isRequired,
  }).isRequired,
};

login.propTypes = {
  credentials: PropTypes.shape({
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

verifyTwoFA.propTypes = {
  tempToken: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  setup: PropTypes.bool,
};

refreshTwoFASetup.propTypes = {
  tempToken: PropTypes.string.isRequired,
  twoFASetup: PropTypes.object.isRequired,
};

forgotPassword.propTypes = {
  email: PropTypes.string.isRequired,
};

firstLogin.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
};

check2FAStatus.propTypes = {
  token: PropTypes.string.isRequired,
};