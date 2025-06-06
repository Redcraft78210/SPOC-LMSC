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


const getAllUsers = async () => {
  try {
    const response = await api.get('/users/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};


const getUserById = async ({ userId }) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};


const createUser = async (userData) => {
  try {
    const response = await api.post('/users/', userData);
    return {
      status: response.status,
      data: response.data,
      message: 'User created successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const updateUser = async ({ userId, userData }) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return {
      status: response.status,
      data: response.data,
      message: 'User updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const deleteUser = async ({ userId }) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const activateUser = async ({ userId }) => {
  try {
    const response = await api.patch(`/users/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'User activated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const deactivateUser = async ({ userId }) => {
  try {
    const response = await api.patch(`/users/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'User deactivated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const generateInviteCode = async ({ role, usageLimit, validityPeriod, classId }) => {
  try {
    const payload = { role };
    if (usageLimit !== undefined) payload.usageLimit = usageLimit;
    if (validityPeriod !== undefined) payload.validityPeriod = validityPeriod;
    if (classId !== undefined && classId !== null) payload.classId = classId;

    const response = await api.post('/codes', payload);
    return {
      status: response.status,
      data: response.data,
      message: 'Invite code generated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const getAllInviteCodes = async () => {
  try {
    const response = await api.get('/codes');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};


const deleteInviteCode = async ({ codeId }) => {
  try {
    const response = await api.delete(`/codes/${codeId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Invite code deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const retrogradeUserRole = async ({ userId }) => {
  try {
    const response = await api.patch(`/users/retrograde/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Utilisateur rétrogradé avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};


const upgradeUserRole = async ({ userId }) => {
  try {
    const response = await api.patch(`/users/upgrade/${userId}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Utilisateur promu avec succès',
    };
  } catch (error) {
    return handleError(error);
  }
};



const changePassword = async ({ oldPassword, newPassword }) => {
  try {
    const response = await api.put('/users/change-password', { oldPassword, newPassword });
    return {
      status: response.status,
      data: response.data,
      message: 'Password changed successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


const disable2FA = async () => {
  try {
    const response = await api.delete('/auth/2fa');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return handleError(error);
  }
};


getAllUsers.propTypes = {};

getUserById.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

changePassword.propTypes = {
  oldPassword: PropTypes.string.isRequired,
  newPassword: PropTypes.string.isRequired,
};

createUser.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    password: PropTypes.string,
  }).isRequired,
};

updateUser.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.object.isRequired,
};

deleteUser.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

activateUser.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

deactivateUser.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

generateInviteCode.propTypes = {
  role: PropTypes.string.isRequired,
  expiresIn: PropTypes.string,
};

getAllInviteCodes.propTypes = {};

deleteInviteCode.propTypes = {
  codeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

retrogradeUserRole.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

upgradeUserRole.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export {
  getAllUsers,
  getUserById,
  createUser,
  changePassword,
  updateUser,
  disable2FA,
  deleteUser,
  activateUser,
  deactivateUser,
  generateInviteCode,
  getAllInviteCodes,
  deleteInviteCode,
  retrogradeUserRole,
  upgradeUserRole,
};
