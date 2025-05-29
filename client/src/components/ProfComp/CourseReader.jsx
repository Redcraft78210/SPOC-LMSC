import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SecureVideoPlayer from '../../components/SecureVideoPlayer';
import SecureDocumentViewer from '../../components/SecureDocumentViewer';
import { toast, Toaster } from 'react-hot-toast';

const API_URL = 'https://localhost:8443/api';

const CourseReader = ({ authToken }) => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const courseId = new URLSearchParams(window.location.search).get('courseId');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // const response = await fetch(`/api/cours/${courseId}`, {
        //   headers: {
        //     Authorization: `Bearer ${authToken}`,
        //   },
        // });

        // if (!response.ok) throw new Error("Cours non trouvé");
        // const data = await response.json();
        const data = {
          Matière: 'math_info', // La matière : Mathématiques et Informatique
          chapitre: 'nombres_complexes', // Chapitre sur les nombres complexes
          titre: 'Introduction aux Nombres Imaginaires', // Titre du cours
          date_creation: '2025-03-15T10:30:00Z', // Date de création en format ISO
          description:
            "Ce cours présente les bases des nombres imaginaires et leur utilité dans la résolution d'équations quadratiques.", // Brève description
          'Date de création': '2025-03-15T10:30:00Z', // Date de création en format ISO
          ID_cours: 'cours_123456', // Identifiant unique du cours
          video: {
            video_id: '3f4b538504facde3c881b73844f52f24-1742237522', // ID unique de la vidéo
            date_mise_en_ligne: '2025-03-20T14:00:00Z', // Date de mise en ligne de la vidéo
          },
          documents: [
            {
              document_id: '3f4b538504facde3c881b73844f52f24-1742237522', // Premier document associé
              title: 'Introduction aux Nombres Imaginaires',
              description: 'Description du premier document',
              date_mise_en_ligne: '2025-03-18T08:45:00Z', // Date de mise en ligne
            },
            {
              document_id: 'doc_002', // Deuxième document associé
              title: 'Explication des Nombres Imaginaires',
              description: 'Description du deuxième document',
              date_mise_en_ligne: '2025-03-19T09:15:00Z', // Date de mise en ligne
            },
          ],
        };

        // const data = {
        //   Matière: 'math_info', // La matière : Mathématiques et Informatique
        //   chapitre: 'nombres_complexes', // Chapitre sur les nombres complexes
        //   titre: 'Introduction aux Nombres Imaginaires', // Titre du cours
        //   date_creation: '2025-03-15T10:30:00Z', // Date de création en format ISO
        //   description:
        //     "Ce cours présente les bases des nombres imaginaires et leur utilité dans la résolution d'équations quadratiques.", // Brève description
        //   'Date de création': '2025-03-15T10:30:00Z', // Date de création en format ISO
        //   ID_cours: 'cours_123456', // Identifiant unique du cours
        //   documents: [
        //     {
        //       document_id: '3f4b538504facde3c881b73844f52f24-1742237522', // Premier document associé
        //       title: 'Introduction aux Nombres Imaginaires',
        //       description: 'Description du premier document',
        //       date_mise_en_ligne: '2025-03-18T08:45:00Z', // Date de mise en ligne
        //     },
        //     // {
        //     //   document_id: '3f4b538504facde3c881b73844f52f24-1742237522', // Deuxième document associé
        //     //   title: 'Explication des Nombres Imaginaires',
        //     //   description: 'Description du deuxième document',
        //     //   date_mise_en_ligne: '2025-03-19T09:15:00Z', // Date de mise en ligne
        //     // },
        //   ],
        // };

        // Extraction de la première entrée du cours
        const { ...content } = data;

        setCourseData(content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, authToken]);

  const handleDownloadDocument = async documentId => {
    try {
      const response = await fetch(
        `${API_URL}/documents/download/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Make sure authToken is in scope
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentId}.pdf`);
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
        <button
          type="button"
          onClick={() => navigate('/courses-library')}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Retour à la bibliothèque des cours
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Toaster />
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
        <div className={`${courseData.video ? 'mt-8 border-t' : 'pt-0'}`}>
          {courseData.video && (
            <h2 className="text-2xl font-bold mb-4">Documents associés</h2>
          )}
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
                    documentId={doc.document_id}
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

      {/* Bouton "Cours terminé" */}
      <div className="text-center mt-8">
        <button
          onClick={() => toast.success('Cours terminé !')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-green-700 transition-colors"
        >
          Cours terminé
        </button>
      </div>
    </div>
  );
};

CourseReader.propTypes = {
  authToken: PropTypes.string.isRequired,
};

export default CourseReader;
