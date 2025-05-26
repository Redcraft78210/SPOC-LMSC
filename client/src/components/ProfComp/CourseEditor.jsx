import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GetCourseDetails, UpdateCourse } from '../../API/ProfGestion';

const CourseEditor = ({ token }) => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState(null);
  const [newDocument, setNewDocument] = useState('');
  const [newVideo, setNewVideo] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const result = await GetCourseDetails(token, courseId);
      if (result && result.status === 200) {
        setCourse(result.data);
      }
    };
    fetchCourseDetails();
  }, [token, courseId]);

  const handleAddDocument = () => {
    if (newDocument) {
      setCourse(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument],
      }));
      setNewDocument('');
    }
  };

  const handleRemoveDocument = doc => {
    setCourse(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d !== doc),
    }));
  };

  const handleAddVideo = () => {
    if (newVideo) {
      setCourse(prev => ({
        ...prev,
        video: newVideo,
      }));
      setNewVideo('');
    }
  };

  const handleRemoveVideo = () => {
    setCourse(prev => ({
      ...prev,
      video: null,
    }));
  };

  const handleSave = async () => {
    const result = await UpdateCourse(token, courseId, course);
    if (result && result.status === 200) {
      alert('Cours mis à jour avec succès');
    }
  };

  if (!course) return <p>Chargement...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier le cours</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">{course.titre}</h2>
        <div>
          <h3 className="text-lg font-semibold">Documents</h3>
          <ul className="list-disc pl-5">
            {course.documents.map(doc => (
              <li key={doc} className="flex justify-between items-center">
                {doc}
                <button
                  onClick={() => handleRemoveDocument(doc)}
                  className="text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newDocument}
            onChange={e => setNewDocument(e.target.value)}
            placeholder="Ajouter un document"
            className="w-full mt-2 p-2 border rounded"
          />
          <button
            onClick={handleAddDocument}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Ajouter
          </button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Vidéo</h3>
          {course.video ? (
            <div className="flex justify-between items-center">
              <span>{course.video}</span>
              <button
                onClick={handleRemoveVideo}
                className="text-red-500 hover:underline"
              >
                Supprimer
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={newVideo}
              onChange={e => setNewVideo(e.target.value)}
              placeholder="Ajouter une vidéo"
              className="w-full mt-2 p-2 border rounded"
            />
          )}
          {!course.video && (
            <button
              onClick={handleAddVideo}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ajouter
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

CourseEditor.propTypes = {
  token: PropTypes.string.isRequired,
};

export default CourseEditor;
