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
