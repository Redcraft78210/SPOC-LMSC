import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SecureVideoPlayer from '../components/SecureVideoPlayer';
import SecureDocumentViewer from '../components/SecureDocumentViewer';
import { toast, Toaster } from 'react-hot-toast';
import { ShieldEllipsis, ShieldBan } from 'lucide-react';
import {
  getCourseById,
  markCourseAsInProgress,
  markCourseAsCompleted,
  getCourseProgress,
  disapproveCourse,
  unblockCourse,
  deleteCourse,
} from '../API/CourseCaller';
import { Get_special_Document } from '../API/DocumentCaller';
import CourseReaderTutorial from '../tutorials/CourseReaderTutorial';

const CourseReader = ({ authToken, userRole }) => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const courseId = new URLSearchParams(window.location.search).get('courseId');
  const [completed, setCompleted] = useState(false);

  // Moderation UI state
  const [showModMenu, setShowModMenu] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [justification, setJustification] = useState('');
  const menuRef = useRef(null);
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const fetchCourseData = async () => {
    try {
      const response = await getCourseById({ courseId });

      if (response.status !== 200) {
        setError('Cours non trouvé');
        return;
      }

      // Marquer le cours comme commencé
      if (!completed) {
        try {
          const progressResponse = await markCourseAsInProgress({ courseId });

          if (progressResponse.status !== 200) {
            if (
              progressResponse.status === 400 &&
              progressResponse.message ===
              'Cannot mark as in progress, already completed'
            ) {
              toast.success(
                'Vous avez déjà terminé ce cours.\nVous pouvez le revoir à tout moment.'
              );
            } else {
              throw new Error(
                progressResponse.message || 'Erreur lors de la validation'
              );
            }
          }
        } catch (err) {
          console.error('Error marking course as in progress:', err);
        }
      }
      setCourseData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, authToken]);

  useEffect(() => {
    const checkCourseCompletion = async () => {
      try {
        const response = await getCourseProgress({ courseId });

        if (response.status === 200) {
          setCompleted(response.data.status === 'completed');
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowModMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleDownloadDocument = async document_id => {
    try {
      const response = await Get_special_Document({ document_id });

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

  // Moderation functions
  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowModMenu((prev) => !prev);
  };

  const handleModAction = (action, e) => {
    e.stopPropagation();
    setShowModMenu(false);
    if (action === 'disapprove') {
      setShowDisapproveModal(true);
    } else if (action === 'unblock') {
      handleUnblockCourse();
    } else if (action === 'delete') {
      handleDeleteCourse();
    }
  };

  const handleCourseDisapproval = async () => {
    if (!justification.trim() || justification.length < 50) {
      toast.error('Veuillez fournir une justification d\'au moins 50 caractères pour la désapprobation.');
      return;
    }
    try {
      const response = await disapproveCourse({
        courseId: courseId,
        justification,
      });

      if (response.status === 200) {
        toast.success('Cours désapprouvé avec succès');
        setShowDisapproveModal(false);
        setJustification('');
        navigate('/courses-library');
      } else {
        throw new Error(response.message || 'Erreur lors de la désapprobation du cours');
      }
    } catch (error) {
      console.error('Erreur lors de la désapprobation du cours:', error);
      toast.error('Une erreur est survenue lors de la désapprobation du cours');
    }
  };

  const handleUnblockCourse = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir débloquer ce cours ?')) {
      return;
    }
    try {
      const response = await unblockCourse(courseId);
      if (response.status === 200) {
        toast.success('Cours débloqué avec succès');
        fetchCourseData();
      } else {
        throw new Error(response.message || 'Erreur lors du déblocage du cours');
      }
    } catch (error) {
      console.error('Erreur lors du déblocage du cours:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors du déblocage du cours'
      );
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }
    try {
      const response = await deleteCourse(courseId);
      if (response.status === 200) {
        toast.success('Cours supprimé avec succès');
        navigate('/courses-library');
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du cours');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de la suppression du cours'
      );
    }
  };

  const handleBlockedMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
    if (!showBlockedTooltip) setShowBlockedTooltip(true);
  };

  const handleBlockedMouseLeave = () => {
    setShowBlockedTooltip(false);
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

  if (!courseData) {
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
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
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
      <Toaster position="top-center" />
      
      {/* Add the tutorial */}
      <CourseReaderTutorial />
      
      {/* Moderation Tool */}
      {(userRole === 'Administrateur' || userRole === 'Professeur') && (
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <button
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
              onClick={handleMenuToggle}
            >
              <ShieldEllipsis className="h-5 w-5 mr-2" />
              Modération
            </button>

            {showModMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md py-1 z-20"
              >
                {userRole === 'Administrateur' && courseData.status === 'blocked' ? (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => handleModAction('unblock', e)}
                  >
                    Débloquer
                  </button>
                ) : userRole === 'Administrateur' && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => handleModAction('disapprove', e)}
                  >
                    Désapprouver
                  </button>
                )}
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={(e) => handleModAction('delete', e)}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blocked Course Alert */}
      {courseData.status === 'blocked' && (
        <div
          className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md"
          onMouseMove={handleBlockedMouseMove}
          onMouseLeave={handleBlockedMouseLeave}
        >
          <div className="flex items-center">
            <ShieldBan className="h-6 w-6 mr-2" />
            <p className="font-medium">Ce cours est actuellement bloqué</p>
          </div>
          {courseData.block_reason && (
            <p className="mt-2 text-sm truncate">{courseData.block_reason}</p>
          )}
        </div>
      )}

      {/* Tooltip for blocked course */}
      {userRole === 'Administrateur' && courseData.status === 'blocked' && showBlockedTooltip && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y + 16,
            maxWidth: 320,
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid #ef4444',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            padding: '1rem',
            color: '#991b1b',
            fontSize: '0.95rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          }}
        >
          <div className="font-bold mb-1 text-red-700">Statut : Bloqué</div>
          <div className="text-gray-700 whitespace-pre-line break-words">
            <span className="font-semibold text-red-600">Motif :</span>
            <br />
            {courseData.block_reason || 'Aucun motif fourni.'}
          </div>
        </div>
      )}

      {/* Disapprove Modal */}
      {showDisapproveModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-100"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Désapprouver le cours</h2>
            <p>Êtes-vous sûr de vouloir désapprouver le cours &quot;{courseData.titre}&quot; ?</p>
            <p className="mt-2 text-sm text-gray-500">
              Celui-ci sera retiré de la bibliothèque et ne sera plus accessible aux utilisateurs.
            </p>
            <textarea
              className="w-full mt-4 p-2 border rounded"
              placeholder="Justification (minimum 50 caractères)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              maxLength={255}
              rows="4"
              required
            />
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleCourseDisapproval}
                disabled={justification.length < 50}
              >
                Désapprouver
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowDisapproveModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête du cours */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 course-title">{courseData.titre}</h1>
        <p className="text-gray-600">{courseData.description}</p>
        <div className="mt-2 text-sm text-gray-500">
          Créé le : {new Date(courseData.date_creation).toLocaleDateString()}
        </div>
      </div>
      
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {/* Section Vidéo */}
      {courseData.video && (
        <div className="mb-8 video-player">
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
        <div className={`${courseData.video ? 'mt-8 border-t' : 'pt-0'} documents-section`}>
          {courseData.video && (
            <h2 className="text-2xl font-bold mb-4">Documents associés</h2>
          )}
          {documentError && (
            <p className="text-red-600 mb-4">{documentError}</p>
          )}
          <div className="grid gap-4">
            {courseData.documents.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4">
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
                      onClick={() => handleDownloadDocument(doc.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors download-button"
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
      {userRole === "Etudiant" && (
        <div className="text-center mt-8">
          {completed ? (
            <p className="text-green-600 font-semibold">
              Cours terminé ! Vous pouvez le revoir à tout moment.
            </p>
          ) : (
            <button
              onClick={handleCompleteCourse}
              className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-green-700 transition-colors complete-course-button"
            >
              Terminer le cours
            </button>
          )}
        </div>
      )}
    </div>
  );
};

CourseReader.propTypes = {
  authToken: PropTypes.string.isRequired,
  userRole: PropTypes.string, // Added for moderation features
};

export default CourseReader;
