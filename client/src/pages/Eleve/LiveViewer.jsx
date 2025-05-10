import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StreamReader } from '../../components/StreamReader';

// Extracted loading spinner component
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

// Extracted error message component
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

const LiveViewer = ({ authToken, streamId }) => {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreamData = useCallback(
    async signal => {
      try {
        const response = await fetch(`/api/streams/${streamId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal,
        });

        if (!response.ok)
          throw new Error('Échec de la récupération des données du stream');
        // const data = await response.json();
        const data = {
          auteur: 'Prof. Jean Dupont',
          titre: 'Introduction à la physique quantique',
          description:
            "Ce live couvre les bases de la physique quantique, y compris les principes d'incertitude et la dualité onde-particule.",
          date_heure_lancement: '2025-05-15 14:00:00',
          chat_enabled: true,
          matiere: 'Physique',
        };

        if (!signal.aborted) {
          setStreamData(data);
          setError(null);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [authToken, streamId]
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchStreamData(abortController.signal);
    return () => abortController.abort();
  }, [fetchStreamData]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
        }}
      />
    );
  if (!streamData) return null;

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="mb-6 p-6 bg-white rounded-xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-sm text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full">
            {streamData.matiere}
          </span>
          <time
            className="text-xs text-gray-500"
            dateTime={streamData.date_heure_lancement}
          >
            {new Date(streamData.date_heure_lancement).toLocaleDateString(
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
          {streamData.titre}
        </h1>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Par</span>
          <span className="font-medium text-gray-800">{streamData.auteur}</span>
        </div>

        <p className="text-gray-700 text-base leading-relaxed">
          {streamData.description}
        </p>
      </div>

      {/* Nouveau layout responsive */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 rounded-xl overflow-hidden">
          <StreamReader authToken={authToken} streamId={streamId} />
        </div>
        <div className="lg:w-96 w-full">
          <ChatBox
            streamId={streamId}
            authToken={authToken}
            chatEnabled={streamData.chat_enabled}
          />
        </div>
      </div>
    </div>
  );
};

const ChatBox = ({ streamId, authToken, chatEnabled }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchMessages = useCallback(
    async signal => {
      try {
        const res = await fetch(`/api/streams/${streamId}/chat`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal,
        });
        if (!res.ok) throw new Error('Erreur lors du chargement du chat');
        // const data = await res.json();
        const data = {
          messages: [
            {
              user: 'Alice',
              text: 'Bonjour à tous !',
              timestamp: '2025-05-10T14:01:00Z',
            },
            {
              user: 'Prof. Jean Dupont',
              text: "Bienvenue au live, n'hésitez pas à poser vos questions.",
              timestamp: '2025-05-10T14:02:00Z',
            },
            {
              user: 'Bob',
              text: 'Merci, hâte de commencer !',
              timestamp: '2025-05-10T14:03:00Z',
            },
            {
              user: 'Alice',
              text: 'Quelle est la durée prévue pour ce live ?',
              timestamp: '2025-05-10T14:04:00Z',
            },
            {
              user: 'Prof. Jean Dupont',
              text: 'Environ 1 heure, avec une session de questions à la fin.',
              timestamp: '2025-05-10T14:05:00Z',
            },
            {
              user: 'Charlie',
              text: 'Est-ce que les slides seront disponibles après le live ?',
              timestamp: '2025-05-10T14:06:00Z',
            },
            {
              user: 'Prof. Jean Dupont',
              text: 'Oui, je les partagerai à la fin.',
              timestamp: '2025-05-10T14:07:00Z',
            },
            {
              user: 'Bob',
              text: 'Super, merci beaucoup !',
              timestamp: '2025-05-10T14:08:00Z',
            },
            {
              user: 'Alice',
              text: 'Est-ce que vous allez parler du principe d’incertitude ?',
              timestamp: '2025-05-10T14:09:00Z',
            },
            {
              user: 'Prof. Jean Dupont',
              text: 'Oui, c’est prévu dans la deuxième partie du live.',
              timestamp: '2025-05-10T14:10:00Z',
            },
            {
              user: 'Charlie',
              text: 'Merci pour cette précision.',
              timestamp: '2025-05-10T14:11:00Z',
            },
            {
              user: 'Bob',
              text: 'Est-ce que vous allez aussi parler de la dualité onde-particule ?',
              timestamp: '2025-05-10T14:12:00Z',
            },
            {
              user: 'Prof. Jean Dupont',
              text: 'Absolument, c’est un des sujets principaux.',
              timestamp: '2025-05-10T14:13:00Z',
            },
          ],
        };
        if (!signal.aborted) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message);
        }
      }
    },
    [streamId, authToken]
  );

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchMessages(abortControllerRef.current.signal);
    return () => abortControllerRef.current.abort();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const tempId = Date.now();
    const optimisticMessage = {
      tempId,
      user: 'Vous',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInput('');
    setSending(true);
    setError(null);

    // try {
    //   const response = await fetch(`/api/streams/${streamId}/chat`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${authToken}`,
    //     },
    //     body: JSON.stringify({ message: input.trim() }),
    //   });

    //   if (!response.ok) throw new Error("Erreur lors de l'envoi");
    //   const newMessage = await response.json();

    //   setMessages(prev =>
    //     prev.map(msg =>
    //       msg.tempId === tempId ? { ...newMessage, tempId: undefined } : msg
    //     )
    //   );
    // } catch (err) {
    //   setError(err.message);
    //   setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
    // } finally {
    //   setSending(false);
    // }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col max-h-[30rem] overflow-hidden transition-all duration-300">
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4 italic">
            Commencez la conversation...
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.tempId || msg.timestamp}
              className="group animate-fade-in flex flex-col gap-1"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-blue-600 text-sm">
                  {msg.user || 'Anonyme'}
                </span>
                <time className="text-[0.7rem] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <div className="text-gray-700 text-sm p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-xs max-w-[85%]">
                {msg.text || msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="text-xs text-red-600 px-3 py-2 bg-red-50 border-t border-red-100 animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {chatEnabled ? (
        <form
          onSubmit={handleSend}
          className="flex border-t border-gray-100 p-3 gap-2 bg-gray-50"
        >
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
            aria-label="Message du chat"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            disabled={sending || !input.trim()}
          >
            {sending ? (
              <>
                <span className="animate-spin">↻</span>
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
        <div className="border-t border-gray-100 p-3 text-center text-gray-400 text-sm bg-gray-50 flex items-center justify-center gap-2">
          <span className="text-red-500">●</span>
          <span>Chat désactivé</span>
        </div>
      )}
    </div>
  );
};

// Add PropTypes for all components
ChatBox.propTypes = {
  streamId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
  chatEnabled: PropTypes.bool.isRequired,
};

LiveViewer.propTypes = {
  authToken: PropTypes.string.isRequired,
  streamId: PropTypes.string.isRequired,
};

export default LiveViewer;
