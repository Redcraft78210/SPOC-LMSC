import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'react-hot-toast';

import { ArrowLeft, User, Clock, MessageSquareText } from 'lucide-react';

const API_URL = 'https://localhost:8443/api';

const Forum = ({ authToken }) => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    fetchThreads();
  }, [pagination.currentPage]);

  const fetchThreads = async () => {
    try {
      const response = await fetch(
        `${API_URL}/forum/threads?page=${pagination.currentPage}&limit=10`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!response.ok) throw new Error('Erreur de chargement des discussions');
      const data = await response.json();
      setThreads(data.threads);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const fetchThreadDetails = async threadId => {
    try {
      const response = await fetch(`${API_URL}/forum/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok)
        throw new Error('Erreur de chargement des détails de la discussion');
      const data = await response.json();
      setSelectedThread(data);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      setError('Veuillez remplir tous les champs');
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forum/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: newThreadTitle.trim(),
          content: newThreadContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de création');
      }

      const threadId = (await response.json()).id; // Récupérer l'ID du thread créé
      console.log('threadId:', threadId);

      await fetchThreads(); // Mettre à jour la liste des threads
      await fetchThreadDetails(threadId); // Charger les détails du thread créé
      setNewThreadTitle('');
      setNewThreadContent('');
      setError('');
      toast.success('Discussion créée avec succès');
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      setError('Veuillez écrire un commentaire');
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/forum/threads/${selectedThread.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de création');
      }

      await fetchThreadDetails(selectedThread.id);
      setNewComment('');
      setError('');
      toast.success('Commentaire publié avec succès');
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4 border-gray-200">
          Forum de discussion
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {!selectedThread ? (
          <>
            <section className="mb-10 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Nouvelle discussion
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    placeholder="Sujet de votre discussion"
                    value={newThreadTitle}
                    onChange={e => setNewThreadTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    placeholder="Détails de votre discussion"
                    value={newThreadContent}
                    onChange={e => setNewThreadContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                  />
                </div>
                <button
                  onClick={handleCreateThread}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    'Publier la discussion'
                  )}
                </button>
              </div>
            </section>

            <section className="space-y-6">
              {threads.map(thread => (
                <article
                  key={thread.id}
                  onClick={() => fetchThreadDetails(thread.id)}
                  className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {thread.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {thread.content}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="inline-flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {thread.User?.username}
                    </span>
                    <span className="inline-flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatDistanceToNow(new Date(thread.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    <span className="inline-flex items-center">
                      <MessageSquareText className="w-4 h-4 mr-1 mt-1" />
                      {thread.commentsCount} réponse
                      {thread.commentsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </article>
              ))}
            </section>

            <div className="mt-6 flex justify-between">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() =>
                  setPagination(prev => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() =>
                  setPagination(prev => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </>
        ) : (
          <div>
            <button
              onClick={() => {
                setSelectedThread(null);
                fetchThreads();
                setError(null);
              }}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux discussions
            </button>

            <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedThread.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1.5" />
                    {selectedThread.User?.username}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDistanceToNow(new Date(selectedThread.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </header>

              <div className="prose prose-blue mb-10 p-4 bg-gray-50 rounded-lg">
                {selectedThread.content}
              </div>

              <section className="space-y-6">
                {selectedThread.Comments.map(comment => (
                  <div
                    key={comment.id}
                    className="pl-6 border-l-4 border-blue-200"
                  >
                    <div className="prose prose-sm text-gray-600">
                      {comment.content}
                    </div>
                    <div className="mt-3 text-sm text-gray-500 flex items-center space-x-3">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1.5" />
                        {comment.User.username}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </section>

              <div className="mt-10 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Votre réponse
                </label>
                <textarea
                  placeholder="Écrivez votre réponse ici..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                  rows="4"
                />
                <button
                  onClick={handleCreateComment}
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Publication...
                    </>
                  ) : (
                    'Publier la réponse'
                  )}
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

Forum.propTypes = {
  authToken: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
};

export default Forum;
