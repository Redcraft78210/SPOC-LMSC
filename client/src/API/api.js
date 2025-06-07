import axios from 'axios';

/**
 * URL de base pour toutes les requêtes API
 * @constant {string}
 */
const baseURL = '/api';

/**
 * Instance Axios configurée pour communiquer avec l'API backend
 * @constant {Object} api
 * @property {string} baseURL - URL de base pour toutes les requêtes
 * @property {number} timeout - Délai maximum en millisecondes avant expiration des requêtes
 * @property {Object} headers - En-têtes HTTP par défaut pour toutes les requêtes
 */
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requêtes qui ajoute automatiquement le token d'authentification
 * aux en-têtes de chaque requête sortante si disponible
 * 
 * @param {Object} config - Configuration de la requête Axios
 * @returns {Object} Configuration modifiée avec le token d'authentification si disponible
 * @throws {Error} Erreur provenant de la requête interceptée
 */
api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Intercepteur de réponses qui gère les erreurs d'authentification
 * Redirige vers la page de déconnexion si le token est invalide
 * ou si l'utilisateur a déjà complété sa première connexion
 * 
 * @param {Object} response - Réponse de l'API
 * @returns {Object} Réponse inchangée en cas de succès
 * @throws {Error} Erreur avec redirection en cas de problème d'authentification
 */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.message?.includes("invalid") && error.response?.data?.message?.includes("token")) {
      console.warn('Unauthorized. Redirecting to login...');
      window.location.href = '/logout';
    } else if (error.response?.data?.message?.includes("User has already completed first login.")) {
      console.warn('User has already completed first login. Redirecting to dashboard...');
      window.location.href = '/logout';
    }
    return Promise.reject(error);
  }
);

export default api;
