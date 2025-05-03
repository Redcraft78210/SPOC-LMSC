import { useEffect, useState } from 'react';
import Checkbox from './Checkbox';
import { UpdateDocument } from '../../API/DocumentCaller'; // On suppose que l'API a une fonction UpdateDocument
import PropTypes from 'prop-types';

const DocumentUpdater = ({ documentData }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [matiere, setMatiere] = useState('');
  const [chapitre, setChapitre] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (documentData) {
      setTitre(documentData.titre || '');
      setDescription(documentData.description || '');
      setMatiere(documentData.Matière || '');
      setChapitre(documentData.chapitre || '');
      setIsMain(documentData.is_main || false);
      setIsPublished(documentData.is_published || false);
    }
  }, [documentData]);

  const handleUpdate = async () => {
    const updatedData = {
      titre,
      description,
      Matière: matiere,
      chapitre,
      is_main: isMain,
      is_published: isPublished,
    };

    try {
      const res = await UpdateDocument({
        document_id: documentData.document.document_id,
        updatedData,
      });

      console.log('Document mis à jour avec succès :', res);
      alert('Document mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      alert('Une erreur est survenue.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Modifier les informations du document PDF
      </h2>

      <input
        type="text"
        value={titre}
        readOnly
        placeholder="Titre du document"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 bg-gray-100 text-gray-500"
      />

      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <input
        type="text"
        value={matiere}
        onChange={e => setMatiere(e.target.value)}
        placeholder="Matière"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <input
        type="text"
        value={chapitre}
        onChange={e => setChapitre(e.target.value)}
        placeholder="Chapitre"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <Checkbox
        label="Document principal"
        setIsMain={setIsMain}
        isMain={isMain}
        text={'Ceci est le document principal du cours.'}
      />
      <br />
      <Checkbox
        label="Document publié"
        isMain={isPublished}
        setIsMain={setIsPublished}
        text={'Publier le document pour les élèves'}
      />

      <button
        onClick={handleUpdate}
        className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Mettre à jour
      </button>
    </div>
  );
};

DocumentUpdater.propTypes = {
  documentData: PropTypes.shape({
    titre: PropTypes.string,
    description: PropTypes.string,
    Matière: PropTypes.string,
    chapitre: PropTypes.string,
    is_main: PropTypes.bool,
    is_published: PropTypes.bool,
    document: PropTypes.shape({
      document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }).isRequired,
  }).isRequired,
};

export default DocumentUpdater;
