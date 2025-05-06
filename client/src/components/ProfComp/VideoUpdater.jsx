import { useEffect, useState } from 'react';
import Checkbox from './Checkbox';
import { UpdateVideo } from '../../API/VideoCaller';
import PropTypes from 'prop-types';

const VideoUpdater = ({ videoData }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [matiere, setMatiere] = useState('');
  const [chapitre, setChapitre] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (videoData) {
      setTitre(videoData.titre || '');
      setDescription(videoData.description || '');
      setMatiere(videoData.Matière || '');
      setChapitre(videoData.chapitre || '');
      setIsMain(videoData.is_main || false);
      setIsPublished(videoData.is_published || false);
    }
  }, [videoData]);

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
      const res = await UpdateVideo({
        video_id: videoData.video.video_id,
        updatedData,
      });

      console.log('Vidéo mise à jour avec succès :', res);
      alert('Vidéo mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      alert('Une erreur est survenue.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Modifier les informations de la vidéo
      </h2>

      <input
        type="text"
        value={titre}
        readOnly
        placeholder="Titre de la vidéo"
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
        label="Vidéo principale"
        setIsMain={setIsMain}
        isMain={isMain}
        text={'Ceci est la vidéo principale du cours.'}
      />
      <br />
      <Checkbox
        label="Vidéo publiée"
        isMain={isPublished}
        setIsMain={setIsPublished}
        text={'Publier la video pour les élèves'}
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

VideoUpdater.propTypes = {
  videoData: PropTypes.shape({
    titre: PropTypes.string,
    description: PropTypes.string,
    Matière: PropTypes.string,
    chapitre: PropTypes.string,
    is_main: PropTypes.bool,
    is_published: PropTypes.bool,
    video: PropTypes.shape({
      video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }).isRequired,
  }).isRequired,
};

export default VideoUpdater;
