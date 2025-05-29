import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SecureVideoPlayer from '../components/SecureVideoPlayer';
import SecureDocumentViewer from '../components/SecureDocumentViewer';
import { toast, Toaster } from 'react-hot-toast';
import {
  getCourseById,
  markCourseAsInProgress,
  markCourseAsCompleted,
  getCourseProgress,
} from '../API/CourseCaller';
import { downloadDocument } from '../API/DocumentCaller';

const CourseReader = ({ authToken }) => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const courseId = new URLSearchParams(window.location.search).get('courseId');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await getCourseById({ courseId });

        if (response.status !== 200) throw new Error('Cours non trouvé');

        // Marquer le cours comme commencé
        try {
          const progressResponse = await markCourseAsInProgress({ courseId });

          if (progressResponse.status !== 200) {
            if (
              progressResponse.status === 400 &&
              progressResponse.message ===
                'Cannot mark as in progress, already completed'
            ) {
              setCompleted(true);
              toast.success(
                'Vous avez déjà terminé ce cours.\nVous pouvez le revoir à tout moment.'
              );
            } else {
              throw new Error(progressResponse.message || 'Erreur lors de la validation');
            }
          }
        } catch (err) {
          console.error('Error marking course as in progress:', err);
          throw err;
        }

        setCourseData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, authToken]);

  useEffect(() => {
    const checkCourseCompletion = async () => {
      try {
        const response = await getCourseProgress({ courseId });

        if (response.status === 200) {
          setCompleted(response.data.completed);
        } else if (response.status !== 404) {
          // 404 expected if no progress record exists
          throw new Error(response.message || 'Erreur lors de la vérification');
        }
      } catch (err) {
        console.error('Completion check error:', err);
        setError(err.message || 'Erreur lors de la vérification');
      }
    };

    if (courseId) {
      checkCourseCompletion();
    }
  }, [courseId, authToken]);

  const handleCompleteCourse = async () => {
    try {
      const response = await markCourseAsCompleted({ courseId });

      if (response.status !== 200) {
        throw new Error(response.message || 'Erreur lors de la validation');
      }

      toast.success('Cours terminé !');
      setCompleted(true);
    } catch (err) {
      console.error('Completion error:', err);
      toast.error(err.message || 'Erreur lors de la validation');
    }
  };

  const handleDownloadDocument = async documentId => {
    try {
      const response = await downloadDocument({ documentId });

      if (response.status !== 200) {
        throw new Error(response.message || 'Erreur lors du téléchargement');
      }

      // Traitement du blob retourné
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${courseData.titre.replace(/[^a-z0-9]/gi, '_')}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      setDocumentError(null);

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
      setDocumentError(err.message || 'Erreur lors du téléchargement');
    }
  };

  if (loading)
    return <div className="text-center p-8">Chargement du cours...</div>;

  if (!courseId) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Cours non trouvé</p>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            navigate('/courses-library');
          }}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Retour à la bibliothèque des cours
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* En-tête du cours */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{courseData.titre}</h1>
        <p className="text-gray-600">{courseData.description}</p>
        <div className="mt-2 text-sm text-gray-500">
          Créé le : {new Date(courseData.date_creation).toLocaleDateString()}
        </div>
      </div>
      <p>{error && <p className="text-red-600 mb-4">{error}</p>}</p>
      {/* Section Vidéo */}
      {courseData.video && (
        <div className="mb-8">
          <SecureVideoPlayer
            videoId={courseData.video.video_id}
            authToken={authToken}
            onError={setError}
          />
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Vidéo mise en ligne le :{' '}
              {new Date(
                courseData.video.date_mise_en_ligne
              ).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Section Documents */}
      {courseData.documents && courseData.documents.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Documents associés</h2>
          {documentError && (
            <p className="text-red-600 mb-4">{documentError}</p>
          )}
          <div className="grid gap-4">
            {courseData.documents.map(doc => (
              <div
                key={doc.document_id || doc.id}
                className="border rounded-lg p-4"
              >
                {!courseData.video && (
                  <SecureDocumentViewer
                    documentId={doc.id}
                    authToken={authToken}
                  />
                )}

                <div className="mt-4">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      Mis en ligne le :{' '}
                      {new Date(doc.date_mise_en_ligne).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDownloadDocument(doc.document_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CourseReader.propTypes = {
  authToken: PropTypes.string.isRequired,
};

export default CourseReader;
