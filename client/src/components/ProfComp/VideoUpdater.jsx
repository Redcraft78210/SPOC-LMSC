import { useEffect, useState } from 'react';
import Checkbox from './Checkbox';
import { UpdateVideo } from '../../API/VideoCaller';
import PropTypes from 'prop-types';

const VideoUpdater = ({ videoData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (videoData) {
      setTitle(videoData.title || '');
      setDescription(videoData.description || '');
      setTeacherName(videoData.teacher_name || '');
      setSubject(videoData.subject || '');
      setIsMain(videoData.is_main || false);
      setIsPublished(videoData.is_published || false);
    }
  }, [videoData]);

  const handleUpdate = async () => {
    const updatedData = {
      title,
      description,
      teacher_name: teacherName,
      subject,
      is_main: isMain,
      is_published: isPublished,
    };

    try {
      const res = await UpdateVideo({
        video_id: videoData.video_id,
        updatedData,
      });

      console.log('Video updated successfully:', res);
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
        value={title}
        readOnly
        placeholder="ID de la vidéo"
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
        value={teacherName}
        onChange={e => setTeacherName(e.target.value)}
        placeholder="Nom de l'enseignant"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      <input
        type="text"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Matière"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
      />

      {/* Checkbox existante pour is_main */}
      <Checkbox
        label="Vidéo principale"
        setIsMain={setIsMain}
        isMain={isMain}
      />
      <br />
      {/* Nouvelle checkbox pour is_published */}
      <Checkbox
        label="Vidéo publiée"
        isMain={isPublished}
        setIsMain={setIsPublished}
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
    title: PropTypes.string,
    description: PropTypes.string,
    teacher_name: PropTypes.string,
    subject: PropTypes.string,
    is_main: PropTypes.bool,
    is_published: PropTypes.bool,
    video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  }).isRequired,
};

export default VideoUpdater;
