import api from './api';
import PropTypes from 'prop-types';

/**
 * Traite les erreurs renvoyées par l'API
 * @param {Error} error - L'objet erreur à traiter
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
 * Récupère tous les documents disponibles
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreurs de requête API gérées par handleError
 * @example
 * const response = await GetAll_Document();
 * if (response.status === 200) {
 *   const documents = response.data;
 * }
 */
const GetAll_Document = async () => {
  try {
    const response = await api.get('/document/all/');
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
 * Envoie un document au serveur
 * @param {Object} params - Paramètres de la fonction
 * @param {File|string} params.file - Le fichier à envoyer
 * @param {string} params.title - Le titre du document
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreurs de requête API gérées par handleError
 * @example
 * const response = await SendDocument({
 *   file: fileObject,
 *   title: "Mon document"
 * });
 */
const SendDocument = async ({ file, title }) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', title);

  try {
    const response = await api.post('/document/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Document sent successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Récupère un document spécifique par son ID
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.document_id - L'identifiant du document à récupérer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données (Blob) et un message
 * @throws {Error} Erreurs de requête API gérées par handleError
 * @example
 * const response = await Get_special_Document({ document_id: "123" });
 * if (response.status === 200) {
 *   const documentBlob = response.data;
 * }
 */
const Get_special_Document = async ({ document_id }) => {
  try {
    const response = await api.get(`/documents/${document_id}`, {
      responseType: 'blob',
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


/**
 * Récupère les informations d'un document spécifique
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.document_id - L'identifiant du document
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreurs de requête API gérées par handleError
 * @example
 * const response = await Get_Document_Information({ document_id: "123" });
 * if (response.status === 200) {
 *   const documentInfo = response.data;
 * }
 */
const Get_Document_Information = async ({ document_id }) => {
  try {
    const response = await api.get(`/document/document-info/${document_id}`);
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
 * Met à jour un document existant
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.document_id - L'identifiant du document à mettre à jour
 * @param {Object} params.updatedData - Les données mises à jour du document
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreurs de requête API gérées par handleError
 * @example
 * const response = await UpdateDocument({
 *   document_id: "123",
 *   updatedData: { title: "Nouveau titre" }
 * });
 */
const UpdateDocument = async ({ document_id, updatedData }) => {
  try {
    const response = await api.put(`/document/update/${document_id}/`, updatedData);
    return {
      status: response.status,
      data: response.data,
      message: 'Document updated successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


/**
 * Supprime un document
 * @param {Object} params - Paramètres de la fonction
 * @param {string|number} params.document_id - L'identifiant du document à supprimer
 * @returns {Promise<Object>} Objet contenant le statut de la réponse, les données et un message
 * @throws {Error} Erreurs de requête API gérées par handleError
 * @example
 * const response = await DeleteDocument({ document_id: "123" });
 * if (response.status === 200) {
 *   console.log("Document supprimé avec succès");
 * }
 */
const DeleteDocument = async ({ document_id }) => {
  try {
    const response = await api.delete(`/document/delete/${document_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Document deleted successfully',
    };
  } catch (error) {
    return handleError(error);
  }
};


SendDocument.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string])
    .isRequired,
  title: PropTypes.string.isRequired,
};

Get_special_Document.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

GetAll_Document.propTypes = {};

Get_Document_Information.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

UpdateDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  updatedData: PropTypes.object.isRequired,
};

DeleteDocument.propTypes = {
  document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export {
  GetAll_Document,
  SendDocument as uploadDocument,
  SendDocument,
  Get_Document_Information,
  Get_special_Document,
  UpdateDocument,
  DeleteDocument,
};
