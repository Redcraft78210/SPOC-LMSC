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

// Récupérer tous les threads du forum (paginés)
const getThreads = async ({ page = 1, limit = 10, search = '', sortBy = 'newest', category = '', author = '' }) => {
  try {
    // Construire les paramètres de requête
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    // Ajouter les paramètres de filtrage seulement s'ils ont une valeur
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (category && category !== 'all') params.append('category', category);
    if (author) params.append('author', author);
    
    // Faire la requête avec tous les paramètres
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

// Récupérer un thread spécifique avec ses commentaires
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

// Créer un nouveau thread
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

// Mettre à jour un thread
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

// Supprimer un thread
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

// Ajouter un commentaire à un thread
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

// Mettre à jour un commentaire
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

// Supprimer un commentaire
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

// PropTypes
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
