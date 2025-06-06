import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StreamReader } from '../components/StreamReader';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { MentionsInput, Mention } from 'react-mentions';
import {
  getLiveById,
  getLiveMessages,
  sendLiveMessage,
  logViewEngagement,
  disapproveLive,
  endLive,
  blockLive,
  unblockLive,
  deleteLive,
} from '../API/LiveCaller';
import { Toaster, toast } from 'react-hot-toast';
import { ShieldEllipsis, ShieldBan, ShieldAlert } from 'lucide-react';

const INACTIVITY_THRESHOLD = 60000;
const TEN_MINUTES = 600;

const WSS_BASE_URL = "wss://172.16.87.30/api"


const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen" role="status">
    <svg
      className="animate-spin h-10 w-10 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="Chargement en cours"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeWidth="4"
        stroke="currentColor"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12zm2.5-1h9a2.5 2.5 0 1 1-5 0h-4a2.5 2.5 0 0 1-5 0z"
      />
    </svg>
  </div>
);


const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
      <strong className="font-bold">Erreur!</strong>
      <span className="block sm:inline"> {message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        aria-label="Réessayer"
      >
        Réessayer
      </button>
    )}
  </div>
);
ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

const LiveNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Live non trouvé</h2>
        <p className="mt-4 text-gray-600">
          Le live que vous essayez de rejoindre n&apos;existe pas ou a été
          supprimé.
        </p>
        <button
          onClick={() => navigate('/courses-library')}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Retour
        </button>
      </div>
    </div>
  );
};

const LiveViewer = ({ authToken, userRole }) => {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamId, setStreamId] = useState('');
  const [userId, setUserId] = useState('');
  const userActivityTimeout = useRef();
  const navigate = useNavigate();


  const [activeViewTime, setActiveViewTime] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [hasReachedTenMinutes, setHasReachedTenMinutes] = useState(false);


  useEffect(() => {
    try {
      const decodedToken = jwtDecode(authToken);
      decodedToken?.id && setUserId(decodedToken.id);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Session invalide');
    }
  }, [authToken]);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const liveId = params.get('liveid');
    liveId ? setStreamId(liveId) : setError('ID de stream manquant');
  }, []);


  useEffect(() => {
    if (!streamData) return;

    let timer;
    let lastUpdateTime = Date.now();

    const handleUserActivity = () => {
      lastUpdateTime = Date.now();
      if (userActivityTimeout.current) {
        clearTimeout(userActivityTimeout.current);
      }
    };

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);
      if (visible) {
        logEngagement('visibility_return');
        lastUpdateTime = Date.now();
      } else {
        logEngagement('visibility_lost');
      }
    };

    const startTracking = () => {
      timer = setInterval(() => {
        const now = Date.now();
        const isActive = now - lastUpdateTime <= INACTIVITY_THRESHOLD;

        if (isPageVisible && isActive) {
          setActiveViewTime(prev => {
            const newTime = prev + 1;
            if (newTime >= TEN_MINUTES && !hasReachedTenMinutes) {
              setHasReachedTenMinutes(true);
              logEngagement('active_ten_minute_view');
            }
            return newTime;
          });
        }
      }, 1000);
    };


    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);

    startTracking();

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, [streamData, isPageVisible, hasReachedTenMinutes, authToken, streamId]);

  const logEngagement = useCallback(() => {
    try {
      logViewEngagement({
        streamId,
        activeViewTime: Math.round(activeViewTime)
      });
    } catch (error) {
      console.error("Failed to log engagement:", error);
    }
  }, [authToken, streamId, activeViewTime]);

  const fetchStreamData = useCallback(async signal => {
    try {
      setLoading(true);
      const response = await getLiveById(streamId);

      if (response.status === 200) {
        setStreamData(response.data);
        setError(null);
      } else if (response.status === 404) {
        setError('Stream non trouvé');
      } else {
        setError(response.message || 'Erreur lors du chargement du stream');
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err.message || 'Erreur lors du chargement du stream');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [streamId]);

  useEffect(() => {
    if (!streamId) return;

    const abortController = new AbortController();
    fetchStreamData(abortController.signal);

    return () => abortController.abort();
  }, [fetchStreamData, streamId]);


  const formatScheduledDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      })
    };
  }, []);


  const calculateTimeRemaining = useCallback((dateString) => {
    const now = new Date();
    const scheduledDate = new Date(dateString);
    const diffMs = scheduledDate - now;

    if (diffMs <= 0) return null;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }, []);

  const [showModMenu, setShowModMenu] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [justification, setJustification] = useState('');
  const menuRef = useRef(null);
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowModMenu((prev) => !prev);
  };

  const handleModAction = (action, e) => {
    e.stopPropagation();
    setShowModMenu(false);
    if (action === 'disapprove') {
      setShowDisapproveModal(true);
    } else if (action === 'stop') {
      setShowStopModal(true);
    } else if (action === 'unblock') {
      handleUnblockLive();
    } else if (action === 'delete') {
      handleDeleteLive();
    }
  };

  const handleLiveDisapproval = async () => {
    if (!justification.trim() || justification.length < 50) {
      toast.error('Veuillez fournir une justification d\'au moins 50 caractères pour la désapprobation.');
      return;
    }
    try {
      const response = await disapproveLive({
        liveId: streamId,
        justification,
      });
      if (response.status === 200) {
        toast.success('Live désapprouvé avec succès');
        setShowDisapproveModal(false);
        setJustification('');
        navigate('/courses-library');
      } else {
        throw new Error(response.message || 'Erreur lors de la désapprobation du live');
      }
    } catch (error) {
      console.error('Erreur lors de la désapprobation du live:', error);
      toast.error('Une erreur est survenue lors de la désapprobation du live');
    }
  };

  const handleStopLive = async () => {
    if (!justification.trim() || justification.length < 50) {
      toast.error('Veuillez fournir une justification d\'au moins 50 caractères.');
      return;
    }

    try {
      const response = await endLive({
        liveId: streamId,
        justification,
      });

      const blockResponse = await blockLive({ liveId: streamId, justification });
      if (blockResponse.status !== 200) {
        throw new Error(blockResponse.message || 'Erreur lors du blocage du live');
      }

      if (response.status === 200) {
        toast.success('Live arrêté avec succès');
        setShowStopModal(false);
        setJustification('');
        navigate('/courses-library');
      } else {
        throw new Error(response.message || 'Erreur lors de l\'arrêt du live');
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du live:', error);
      toast.error('Une erreur est survenue lors de l\'arrêt du live');
    }
  };

  const handleUnblockLive = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir débloquer ce live ?')) {
      return;
    }
    try {
      const response = await unblockLive(streamId);
      if (response.status === 200) {
        toast.success('Live débloqué avec succès');
        fetchStreamData(new AbortController().signal);
      } else {
        throw new Error(response.message || 'Erreur lors du déblocage du live');
      }
    } catch (error) {
      console.error('Erreur lors du déblocage du live:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors du déblocage du live'
      );
    }
  };

  const handleDeleteLive = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce live ?')) {
      return;
    }
    try {
      const response = await deleteLive(streamId);
      if (response.status === 200) {
        toast.success('Live supprimé avec succès');
        navigate('/courses-library');
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du live');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du live:', error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de la suppression du live'
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

  if (error === 'Stream non trouvé') return <LiveNotFound />;
  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  if (!streamData) return null;

  const isScheduled = streamData.status === 'scheduled';
  const scheduledDate = isScheduled ? formatScheduledDate(streamData.start_time) : null;
  const timeRemaining = isScheduled ? calculateTimeRemaining(streamData.start_time) : null;

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Moderation controls for admins */}
      {userRole === 'Administrateur' && (
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
                {streamData && (streamData.status === 'blocked' || streamData.status === 'disapproved') ? (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => handleModAction('unblock', e)}
                  >
                    Débloquer
                  </button>
                ) : streamData && streamData.status === 'scheduled' ? (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => handleModAction('disapprove', e)}
                  >
                    Désapprouver
                  </button>
                ) : streamData && streamData.status === 'ongoing' ? (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={(e) => handleModAction('stop', e)}
                  >
                    Arrêter le live
                  </button>
                ) : null}
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

      {/* Blocked Live Alert */}
      {streamData && streamData.status === 'blocked' ? (
        <div
          className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md"
          onMouseMove={handleBlockedMouseMove}
          onMouseLeave={handleBlockedMouseLeave}
        >
          <div className="flex items-center">
            <ShieldBan className="h-6 w-6 mr-2" />
            <p className="font-medium">Ce live est actuellement bloqué</p>
          </div>
          {streamData.block_reason && (
            <p className="mt-2 text-sm truncate">{streamData.block_reason}</p>
          )}
        </div>
      ) : streamData && streamData.status === 'disapproved' ? (
        <div
          className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md"
          onMouseMove={handleBlockedMouseMove}
          onMouseLeave={handleBlockedMouseLeave}
        >
          <div className="flex items-center">
            <ShieldAlert className="h-6 w-6 mr-2" />
            <p className="font-medium">Ce live n&apos;a pas été approuvé par la modération</p>
          </div>
          {streamData.block_reason && (
            <p className="mt-2 text-sm truncate">{streamData.block_reason}</p>
          )}
        </div>
      ) : null}

      {/* Tooltip for blocked live */}
      {userRole === 'Administrateur' && streamData && (streamData.status === 'blocked' || streamData.status === 'disapproved') && showBlockedTooltip && (
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
            {streamData.block_reason || 'Aucun motif fourni.'}
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
            <h2 className="text-xl font-semibold mb-4">Désapprouver le live</h2>
            <p>Êtes-vous sûr de vouloir désapprouver le live &quot;{streamData.title}&quot; ?</p>
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
                onClick={handleLiveDisapproval}
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

      {/* Stop Live Modal */}
      {showStopModal && (
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
            <h2 className="text-xl font-semibold mb-4">Arrêter le live</h2>
            <p>Êtes-vous sûr de vouloir arrêter le live &quot;{streamData.title}&quot; ?</p>
            <p className="mt-2 text-sm text-gray-500">
              Le live sera immédiatement interrompu pour tous les spectateurs.
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
                onClick={handleStopLive}
                disabled={justification.length < 50}
              >
                Arrêter le live
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowStopModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 p-6 bg-white rounded-xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full">
            {streamData.subject}
          </span>
          <time
            className="text-xs text-gray-500"
            dateTime={streamData.start_time}
          >
            {new Date(streamData.start_time).toLocaleDateString(
              'fr-FR',
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Paris',
              }
            )}
          </time>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {streamData.title}
        </h1>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Par</span>
          <span className="font-medium text-red-800 ">Professeur {streamData.professor}</span>
        </div>

        <p className="text-gray-700 text-base leading-relaxed">
          {streamData.description}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Container du player */}
        <div className="flex-1 rounded-xl overflow-visible relative">
          {!isScheduled && <StreamReader
            authToken={authToken}
            streamId={streamId}
            controls={streamData.status !== 'blocked' && streamData.status !== 'disapproved'}
            status={streamData.status}
          />}

          {isScheduled && (
            <div className="bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white w-full p-6 rounded-xl">
              <div className="inline-block p-3 bg-blue-600 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Live programmé</h2>
              <p className="text-gray-300">Ce live commencera le</p>
              <div className="font-medium text-xl">{scheduledDate?.day}</div>
              <div className="text-2xl font-bold text-blue-400">{scheduledDate?.time}</div>

              {timeRemaining && (
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{timeRemaining.days}</div>
                    <div className="text-xs text-gray-400">jours</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                    <div className="text-xs text-gray-400">heures</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                    <div className="text-xs text-gray-400">minutes</div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-400 mt-4">
                Revenez à l&apos;heure indiquée pour regarder ce live.
              </p>
            </div>
          )}
        </div>

        {/* Container du chat */}
        <div className="lg:w-96 w-full">
          <ChatBox
            streamId={streamId}
            authToken={authToken}
            chatEnabled={!isScheduled && streamData.chat_enabled}
            userId={userId}
            isScheduled={isScheduled}
            streamData={streamData}
          />
        </div>
      </div>
    </div>
  );
};

const ChatBox = ({ streamId, authToken, chatEnabled, userId, isScheduled, streamData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [disciplinaryWarning, setDisciplinaryWarning] = useState(null);
  const [showDisciplinaryWarning, setShowDisciplinaryWarning] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [participants, setParticipants] = useState([


  ]);

  const wsRef = useRef(null);


  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!streamId || !authToken) return;

      setLoadingMessages(true);
      try {
        const response = await getLiveMessages(streamId);

        if (response.status === 200) {
          setMessages(response.data.messages || []);
          setError(null);
        } else {
          setError(response.message || "Erreur lors du chargement des messages");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique du chat:", err);
        setError('Impossible de charger les messages précédents.');
      } finally {
        setLoadingMessages(false);
      }
    };

    if (chatEnabled && !isScheduled && streamData && streamData.status !== 'blocked' && streamData.status !== 'disapproved') {
      fetchChatHistory();
    }
  }, [streamId, authToken, chatEnabled, isScheduled]);


  useEffect(() => {

    if (
      streamData &&
      (streamData.status === "blocked" || streamData.status === "disapproved")
    ) {
      return;
    }

    const connectWebSocket = () => {
      const ws = new WebSocket(`${WSS_BASE_URL}/chat?token=${authToken}`);
      wsRef.current = ws;


      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      ws.onopen = () => {

        setError(null);
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);


          switch (data.type) {
            case 'new_message':

              if (data.user_id === userId) {

                break;
              }

              setMessages(prevMessages => [...prevMessages, data]);
              break;
            case 'error':
              setError(data.message);
              break;

            case 'message_deleted':
              setMessages(prev =>
                prev.filter(msg => msg.id !== data.messageId)
              );
              break;

            case 'user_messages_deleted':
              setMessages(prev =>
                prev.filter(msg => msg.user_id !== data.userId)
              );
              break;

            default:

          }
        } catch (err) {
          console.error('Erreur lors du traitement du message WebSocket:', err);
        }
      };

      ws.onclose = () => {

      };

      ws.onerror = error => {
        console.error('WebSocket Error:', error);
        setError('Erreur de connexion au chat.');
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [authToken, userId, streamData]);


  useEffect(() => {
    const fetchParticipants = async () => {
      if (!streamId || !authToken) return;

      try {








        const data = [
          { id: '1', display: 'Alice Dupont' },
          { id: '2', display: 'Bob Martin' },
          { id: '3', display: 'Charlie Dupont' },
        ];

        setParticipants(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des participants:', err);
      }
    };

    fetchParticipants();
  }, [streamId, authToken]);


  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Erreur lors du défilement automatique:', err);
      setError('Erreur lors du défilement des messages.');
    }
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const tempId = Date.now().toString();


    setMessages(prev => [
      ...prev,
      {
        tempId,
        content: input.trim(),
        user_id: userId,
        createdAt: new Date().toISOString(),
        User: { name: 'Vous' },
      },
    ]);

    try {
      const message = input.trim();
      setInput('');

      const response = await sendLiveMessage({
        liveId: streamId,
        message: message,
        tempId: tempId
      });

      if (response.status !== 201) {
        if (response.message?.includes('forbidden words')) {
          setShowDisciplinaryWarning(true);
          setDisciplinaryWarning(response.message);
        } else {
          setError(response.message || "Erreur lors de l'envoi du message");
        }

        setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError("Erreur lors de l'envoi du message");

      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
    } finally {
      setSending(false);
    }
  };


  const mentionsInputStyle = {
    control: {
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      maxHeight: '8rem',
      overflowX: 'auto',
      padding: '0.5rem 1rem',
      resize: 'none',
    },
    highlighter: {
      backgroundColor: 'red',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      wordBreak: 'break-all',
    },
    input: {
      padding: '0.5rem 1rem',
      maxHeight: '8rem',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      wordBreak: 'break-all',
      overflowY: 'auto',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        fontSize: '0.875rem',
      },
      item: {
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #e2e8f0',
        '&focused': {
          backgroundColor: '#EBF4FF',
        },
      },
    },
  };


  const renderMessageContent = content => {

    const mentionPattern = /@\[([^\]]+)\]\((\d+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;


    while ((match = mentionPattern.exec(content)) !== null) {

      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }


      const [, display, id] = match;
      parts.push(
        <span
          key={`mention-${id}-${match.index}`}
          className="font-medium text-blue-600 bg-blue-50 px-1 rounded"
        >
          @{display}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }


    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length ? parts : content;
  };

  return (
    <div className="flex flex-col max-h-[30rem] overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 relative">
      {/* Overlay for scheduled live */}
      {isScheduled && (
        <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-md z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="font-medium text-gray-700">Chat verrouillé</h3>
            <p className="text-sm text-gray-500 mt-1">
              Le chat sera disponible lorsque le live commencera
            </p>
          </div>
        </div>
      )}

      {/* Zone des messages */}
      {chatEnabled || streamData.status === 'scheduled' && (
        <div className={`flex-1 p-3 space-y-3 overflow-y-auto bg-gradient-to-b from-gray-50 to-white ${isScheduled ? 'blur-sm' : ''}`}>
          {loadingMessages ? (

            <div className="flex items-center justify-center py-4">
              <svg
                className="w-5 h-5 text-blue-500 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                />
              </svg>
            </div>
          ) : messages.length === 0 ? (

            <div className="py-4 text-sm italic text-center text-gray-400">
              Commencez la conversation...
            </div>
          ) : (

            messages.map((msg, index) => (
              <div
                key={msg.id || `message-${index}`}
                className="flex flex-col gap-1 group animate-fade-in"
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm font-medium ${isScheduled ? 'text-gray-400' :
                      msg.User?.name?.includes('Professeur')
                        ? 'text-red-600 font-semibold'
                        : 'text-blue-600'
                      }`}
                  >
                    {isScheduled
                      ? '••••••••'
                      : userId === msg.user_id
                        ? 'Vous'
                        : msg.User?.name || 'Anonyme'}
                  </span>
                  <time className="text-[0.7rem] text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {isScheduled
                      ? '••:••'
                      : new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </time>
                </div>
                <div
                  className={`p-2 text-sm ${isScheduled ? 'text-gray-400' : 'text-gray-700'} bg-gray-50 rounded-lg border border-gray-100 shadow-sm max-w-[85%] ${msg.user_id === userId ? 'mr-auto' : ''
                    }`}
                >
                  {isScheduled
                    ? '•••••••••••••••••••••••••••••••••'
                    : renderMessageContent(msg.content)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className={`px-3 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 animate-pulse ${isScheduled ? 'blur-sm' : ''}`}>
          ⚠️ {error}
        </div>
      )}

      {/* Zone de saisie avec react-mentions */}
      {chatEnabled && !isScheduled ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100"
        >
          <div className="flex-1">
            <MentionsInput
              value={input || ''}
              onChange={e => setInput(e.target.value || '')}
              style={mentionsInputStyle}
              placeholder="Écrivez votre message... (@ pour mentionner)"
              a11ySuggestionsListLabel="Participants suggérés"
              disabled={sending}
              className="w-full px-4 py-2 text-sm  resize-none outline-none transition focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            >
              <Mention
                markup="@[__display__](__id__)"
                trigger="@"
                data={participants}
                style={{
                  backgroundColor: 'transparent',
                  color: 'red',
                }}
                renderSuggestion={(suggestion, _, highlighted) => (
                  <div className="flex items-center gap-2 px-2 py-1">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                      {(suggestion.display || '?').charAt(0)}
                    </div>
                    <div>{highlighted || suggestion.display}</div>
                  </div>
                )}
                displayTransform={(id, display) => `@${display}`}
              />
            </MentionsInput>
          </div>
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white rounded-full bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <span>✉️</span>
                <span>Envoyer</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 p-3 text-sm text-center text-gray-400 bg-gray-50 border-t border-gray-100">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          {isScheduled ? "Chat indisponible - Live programmé" : "Chat désactivé"}
        </div>
      )}

      {/* Avertissement disciplinaire */}
      {showDisciplinaryWarning && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disciplinary-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setShowDisciplinaryWarning(false)}
          onKeyDown={e =>
            e.key === 'Escape' && setShowDisciplinaryWarning(false)
          }
        >
          <div
            className="mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="w-6 h-6 text-red-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h2
                    id="disciplinary-heading"
                    className="text-xl font-semibold text-gray-900"
                  >
                    Avertissement disciplinaire
                  </h2>
                </div>

                {/* Nouveau contenu textuel */}
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">{disciplinaryWarning}</p>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h3 className="flex items-center gap-2 mb-2 font-medium text-amber-700">
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Raison de l&apos;avertissement
                    </h3>
                    <p className="text-sm">
                      Vous avez enfreint notre charte de conduite en partageant
                      du contenu inapproprié. Ce comportement est contraire à
                      l&apos;article 4.2 de nos conditions d&apos;utilisation.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-1 text-sm font-medium">
                        <svg
                          className="w-4 h-4 text-gray-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Règles violées
                      </h4>
                      <ul className="pl-5 text-sm list-disc">
                        <li>Langage inapproprié</li>
                        <li>Partage d&apos;informations personnelles</li>
                        <li>Spam répété</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-1 text-sm font-medium text-red-700">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        Conséquences
                      </h4>
                      <ul className="pl-5 text-sm list-disc">
                        <li>Restriction des fonctionnalités</li>
                        <li>Surveillance accrue</li>
                        <li>Possibilité de suspension</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-700">
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Prochaines étapes
                    </h3>
                    <p className="text-sm">
                      Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur ou
                      souhaitez contester cette décision, veuillez contacter
                      notre équipe de modération à
                      <a
                        href="mailto:moderation@spoc.lmsc"
                        className="ml-1 text-blue-600 underline hover:text-blue-800"
                      >
                        moderation@spoc.lmsc
                      </a>{' '}
                      dans les 48 heures.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDisciplinaryWarning(false)}
                className="ml-4 p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fermer l'avertissement"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDisciplinaryWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setDisciplinaryWarning(null);
                  setShowDisciplinaryWarning(false);
                  setMessages(prev =>
                    prev.filter(msg => msg.id !== disciplinaryWarning.id)
                  );
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-colors"
              >
                Je comprends et accepte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ChatBox.propTypes = {
  streamId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
  chatEnabled: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  isScheduled: PropTypes.bool,
  streamData: PropTypes.object,
};

LiveViewer.propTypes = {
  authToken: PropTypes.string.isRequired,
  userRole: PropTypes.string,
};

export default LiveViewer;
