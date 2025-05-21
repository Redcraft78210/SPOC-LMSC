import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UpdateDocument, DeleteDocument } from '../../API/DocumentCaller';
import { toast } from 'react-hot-toast';

const DocumentUpdater = ({ documentData, onUpdate }) => {
  const [description, setDescription] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (documentData) {
      console.log('Document data received:', documentData);
      setDescription(documentData.commit_msg || '');
      setIsMain(documentData.is_main || false);
    }
  }, [documentData]);

  const handleUpdate = async () => {
    try {
      if (!documentData?.id) {
        toast.error('Aucun document sélectionné');
        return;
      }

      const updatedData = {
        commit_msg: description,
        is_main: isMain,
        cours: documentData.cours,
      };

      console.log('Sending update with data:', updatedData);
      const response = await UpdateDocument(documentData.id, updatedData);

      if (response.status === 200) {
        onUpdate();
        toast.success('Document mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du document');
    }
  };

  const handleDelete = async () => {
    try {
      if (!documentData?.id) {
        toast.error('Aucun document sélectionné');
        return;
      }

      // Créer une promesse pour la confirmation
      const confirmed = await new Promise(resolve => {
        toast(
          t => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Confirmer la suppression ?</p>
              <p className="text-sm text-gray-600">
                Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(false);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(true);
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ),
          {
            duration: Infinity,
            position: 'top-center',
          }
        );
      });

      if (confirmed) {
        const response = await DeleteDocument(documentData.id);
        if (response.status === 200) {
          onUpdate();
          toast.success('Document supprimé avec succès');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du document');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Modifier les informations du document
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Description du document"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isMain}
              onChange={e => setIsMain(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Document principal</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Publié</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleUpdate}
          disabled={!documentData}
          className={`flex-1 py-2 px-4 rounded-md ${
            !documentData
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {documentData ? 'Mettre à jour' : 'Sélectionnez un document'}
        </button>

        <button
          onClick={handleDelete}
          disabled={!documentData}
          className={`py-2 px-4 rounded-md ${
            !documentData
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

DocumentUpdater.propTypes = {
  documentData: PropTypes.shape({
    id: PropTypes.string,
    commit_msg: PropTypes.string,
    cours: PropTypes.string,
    is_main: PropTypes.bool,
    is_published: PropTypes.bool,
  }),
  onUpdate: PropTypes.func.isRequired,
};

export default DocumentUpdater;
