import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GetCourseDetails, UpdateCourse } from '../../API/ProfGestion';

const CourseReader = ({ token }) => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState(null);
  const [newDocument, setNewDocument] = useState(null); // Pour les fichiers PDF
  const [newVideo, setNewVideo] = useState(null); // Pour les fichiers MP4
  const [isSaving, setIsSaving] = useState(false);

  // Fetch course details
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
        documents: [...prev.documents, newDocument.name],
      }));
      setNewDocument(null);
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
        video: newVideo.name,
      }));
      setNewVideo(null);
    }
  };

  const handleRemoveVideo = () => {
    setCourse(prev => ({
      ...prev,
      video: null,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await UpdateCourse(courseId, course);
    setIsSaving(false);
    if (result && result.status === 200) {
      alert('Cours mis à jour avec succès');
    } else {
      alert('Erreur lors de la mise à jour du cours');
    }
  };

  if (!course) return <p>Chargement...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier le cours</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">{course.titre}</h2>

        {/* Section pour les documents */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Documents</h3>
          {course?.documents?.length > 0 ? (
            <ul className="list-disc pl-5">
              {course.documents.map(doc => (
                <li key={doc} className="flex justify-between items-center">
                  <span>{doc}</span>
                  <button
                    onClick={() => handleRemoveDocument(doc)}
                    className="text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun document disponible.</p>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={e => setNewDocument(e.target.files[0])}
            className="w-full mt-2 p-2 border rounded"
          />
          <button
            onClick={handleAddDocument}
            disabled={!newDocument}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Ajouter
          </button>
        </div>

        {/* Section pour la vidéo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Vidéo</h3>
          {course?.video ? (
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
            <p className="text-gray-500">Aucune vidéo disponible.</p>
          )}
          {!course?.video && (
            <input
              type="file"
              accept=".mp4"
              onChange={e => setNewVideo(e.target.files[0])}
              className="w-full mt-2 p-2 border rounded"
            />
          )}
          {!course?.video && (
            <button
              onClick={handleAddVideo}
              disabled={!newVideo}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Ajouter
            </button>
          )}
        </div>

        {/* Bouton pour sauvegarder */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`mt-4 px-4 py-2 rounded ${
            isSaving
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};

CourseReader.propTypes = {
  token: PropTypes.string.isRequired,
};

export default CourseReader;
