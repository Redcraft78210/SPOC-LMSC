import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère uniformément les erreurs d'API
 * 
 * @param {Error} error - L'objet erreur capturé dans le bloc catch
 * @returns {Object} Objet formaté contenant le statut, les données et le message d'erreur
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
 * Récupère une liste paginée de threads avec filtres optionnels
 * 
 * @param {Object} options - Options de requête
 * @param {number} [options.page=1] - Numéro de page pour la pagination
 * @param {number} [options.limit=10] - Nombre de threads par page
 * @param {string} [options.search=''] - Terme de recherche
 * @param {string} [options.sortBy='newest'] - Critère de tri ('newest', etc.)
 * @param {string} [options.category=''] - Catégorie pour filtrer les threads
 * @param {string} [options.author=''] - Auteur pour filtrer les threads
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const getThreads = async ({ page = 1, limit = 10, search = '', sortBy = 'newest', category = '', author = '' }) => {
  try {

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    

    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (category && category !== 'all') params.append('category', category);
    if (author) params.append('author', author);
    

    const response = await api.get(`/forum/threads?${params.toString()}`);
    
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
 * Récupère un thread spécifique par son identifiant
 * 
 * @param {Object} options - Options de requête
 * @param {(string|number)} options.threadId - L'identifiant du thread à récupérer
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const getThreadById = async ({ threadId }) => {
  try {
    const response = await api.get(`/forum/threads/${threadId}`);
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
 * Crée un nouveau thread dans le forum
 * 
 * @param {Object} options - Données du thread
 * @param {string} options.title - Titre du thread
 * @param {string} options.content - Contenu du thread
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const createThread = async ({ title, content }) => {
  try {
    const response = await api.post('/forum/threads', { title, content });
    return {
      status: response.status,
      data: response.data,
      message: 'Thread created successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Met à jour un thread existant
 * 
 * @param {Object} options - Données de mise à jour
 * @param {(string|number)} options.threadId - Identifiant du thread à mettre à jour
 * @param {string} [options.title] - Nouveau titre du thread
 * @param {string} [options.content] - Nouveau contenu du thread
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const updateThread = async ({ threadId, title, content }) => {
  try {
    const response = await api.put(`/forum/threads/${threadId}`, { title, content });
    return {
      status: response.status,
      data: response.data,
      message: 'Thread updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Supprime un thread
 * 
 * @param {Object} options - Options de suppression
 * @param {(string|number)} options.threadId - Identifiant du thread à supprimer
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const deleteThread = async ({ threadId }) => {
  try {
    const response = await api.delete(`/forum/threads/${threadId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Thread deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Ajoute un commentaire à un thread
 * 
 * @param {Object} options - Données du commentaire
 * @param {(string|number)} options.threadId - Identifiant du thread parent
 * @param {string} options.content - Contenu du commentaire
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const addComment = async ({ threadId, content }) => {
  try {
    const response = await api.post(`/forum/threads/${threadId}/comments`, { content });
    return {
      status: response.status,
      data: response.data,
      message: 'Comment added successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Met à jour un commentaire existant
 * 
 * @param {Object} options - Données de mise à jour
 * @param {(string|number)} options.commentId - Identifiant du commentaire à mettre à jour
 * @param {string} options.content - Nouveau contenu du commentaire
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const updateComment = async ({ commentId, content }) => {
  try {
    const response = await api.put(`/forum/comments/${commentId}`, { content });
    return {
      status: response.status,
      data: response.data,
      message: 'Comment updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Supprime un commentaire
 * 
 * @param {Object} options - Options de suppression
 * @param {(string|number)} options.commentId - Identifiant du commentaire à supprimer
 * @returns {Promise<Object>} Promesse résolue avec {status, data, message}
 */
const deleteComment = async ({ commentId }) => {
  try {
    const response = await api.delete(`/forum/comments/${commentId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Comment deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


getThreads.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
  search: PropTypes.string,
  sortBy: PropTypes.string,
  category: PropTypes.string,
  author: PropTypes.string,
};

getThreadById.propTypes = {
  threadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

createThread.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

updateThread.propTypes = {
  threadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  content: PropTypes.string,
};

deleteThread.propTypes = {
  threadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

addComment.propTypes = {
  threadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  content: PropTypes.string.isRequired,
};

updateComment.propTypes = {
  commentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  content: PropTypes.string.isRequired,
};

deleteComment.propTypes = {
  commentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  addComment,
  updateComment,
  deleteComment,
};
