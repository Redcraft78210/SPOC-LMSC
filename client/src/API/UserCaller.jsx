import api from './api';
import PropTypes from 'prop-types';

/**
 * Gère les erreurs d'API de manière uniforme
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
 * Récupère tous les utilisateurs du système
 * 
 * @async
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 * 
 * @example
 * const result = await getAllUsers();
 * if (result.status === 200) {
 *   const users = result.data;
 * }
 */
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


/**
 * Récupère un utilisateur par son identifiant
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à récupérer
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Crée un nouvel utilisateur dans le système
 * 
 * @async
 * @param {Object} userData - Données de l'utilisateur à créer
 * @param {string} userData.name - Prénom de l'utilisateur
 * @param {string} userData.surname - Nom de l'utilisateur
 * @param {string} userData.email - Adresse email de l'utilisateur
 * @param {string} userData.role - Rôle de l'utilisateur
 * @param {string} [userData.password] - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Met à jour les informations d'un utilisateur existant
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à mettre à jour
 * @param {Object} params.userData - Nouvelles données de l'utilisateur
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Supprime un utilisateur du système
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à supprimer
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Active un compte utilisateur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à activer
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Désactive un compte utilisateur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à désactiver
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Génère un code d'invitation pour l'inscription d'un nouvel utilisateur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string} params.role - Rôle attribué à l'utilisateur qui utilisera ce code
 * @param {number} [params.usageLimit] - Nombre d'utilisations autorisées pour ce code
 * @param {string} [params.validityPeriod] - Période de validité du code
 * @param {(string|number)} [params.classId] - Identifiant de la classe associée au code
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Récupère tous les codes d'invitation du système
 * 
 * @async
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Supprime un code d'invitation
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.codeId - Identifiant du code à supprimer
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Rétrograde le rôle d'un utilisateur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à rétrograder
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Promeut le rôle d'un utilisateur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {(string|number)} params.userId - Identifiant de l'utilisateur à promouvoir
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Change le mot de passe d'un utilisateur
 * 
 * @async
 * @param {Object} params - Paramètres de la fonction
 * @param {string} params.oldPassword - Ancien mot de passe de l'utilisateur
 * @param {string} params.newPassword - Nouveau mot de passe de l'utilisateur
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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


/**
 * Désactive l'authentification à deux facteurs pour l'utilisateur actuel
 * 
 * @async
 * @returns {Promise<Object>} Résultat de la requête contenant le statut, les données et un message
 * @throws {Error} Erreurs capturées et traitées par handleError
 */
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
