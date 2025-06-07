import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère uniformément les erreurs API
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
 * Vérifie la validité d'un code d'inscription
 * 
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.code - Code d'inscription à vérifier
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
 * 
 * @example
 * const result = await checkRegisterCode({ code: "ABC123" });
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
 * Enregistre un nouvel utilisateur
 * 
 * @param {Object} userData - Données de l'utilisateur
 * @param {string} userData.email - Email de l'utilisateur
 * @param {string} userData.username - Nom d'utilisateur
 * @param {string} userData.password - Mot de passe
 * @param {string} userData.name - Prénom
 * @param {string} userData.surname - Nom de famille
 * @param {string} userData.registerCode - Code d'inscription
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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
 * Authentifie un utilisateur
 * 
 * @param {Object} credentials - Identifiants de connexion
 * @param {string} credentials.email - Email de l'utilisateur
 * @param {string} credentials.password - Mot de passe
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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
 * Vérifie un code d'authentification à deux facteurs
 * 
 * @param {Object} params - Paramètres de vérification
 * @param {string} params.tempToken - Token temporaire reçu après connexion
 * @param {string} params.code - Code 2FA à vérifier
 * @param {boolean} [params.setup] - Indique si c'est une vérification lors de la configuration
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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
 * Rafraîchit la configuration de l'authentification à deux facteurs
 * 
 * @param {Object} params - Paramètres de rafraîchissement
 * @param {string} params.tempToken - Token temporaire
 * @param {Object} params.twoFASetup - Informations de configuration 2FA
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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
 * Initialise la configuration de l'authentification à deux facteurs
 * 
 * @returns {Promise<Object>} Résultat de la requête avec statut, données (incluant QR code) et message
 * @throws {Error} Erreur capturée et traitée par handleError
 */
export const setup2FA = async () => {
  try {
    const response = await api.post('/auth/activate-2fa');
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
 * Désactive l'authentification à deux facteurs pour l'utilisateur connecté
 * 
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
 */
export const disable2FA = async () => {
  try {
    const response = await api.delete('/users/2fa');
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
 * Vérifie la configuration de l'authentification à deux facteurs
 * 
 * @param {Object} params - Paramètres de vérification
 * @param {string} params.code - Code 2FA à vérifier
 * @param {string} params.tempToken - Token temporaire
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
 */
export const verify2FASetup = async ({ code, tempToken }) => {
  try {
    const response = await api.post('/auth/verify-2fa', { code, tempToken, setup: true });
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
 * Demande un lien de réinitialisation de mot de passe
 * 
 * @param {Object} params - Paramètres de la demande
 * @param {string} params.email - Email de l'utilisateur
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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
 * Effectue la première connexion d'un utilisateur (définition de ses identifiants)
 * 
 * @param {Object} params - Paramètres de première connexion
 * @param {string} params.username - Nom d'utilisateur choisi
 * @param {string} params.password - Mot de passe choisi
 * @param {string} params.token - Token d'invitation
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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
 * Vérifie l'état de l'authentification à deux facteurs pour l'utilisateur
 * 
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.token - Token d'authentification
 * @returns {Promise<Object>} Résultat de la requête avec statut, données et message
 * @throws {Error} Erreur capturée et traitée par handleError
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

verify2FASetup.propTypes = {
  code: PropTypes.string.isRequired,
};

disable2FA.propTypes = {
  code: PropTypes.string.isRequired,
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