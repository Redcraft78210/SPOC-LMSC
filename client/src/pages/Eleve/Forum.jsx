import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, User, Clock, MessageSquareText } from 'lucide-react';
import {
  getThreads,
  getThreadById,
  createThread,
  addComment
} from '../API/ForumCaller';

const Forum = ({ authToken }) => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [disciplinaryWarning, setDisciplinaryWarning] = useState(null);
  const [showDisciplinaryWarning, setShowDisciplinaryWarning] = useState(false);
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
      setLoading(true);
      const response = await getThreads({ 
        page: pagination.currentPage, 
        limit: 10 
      });
      
      if (response.status === 200) {
        setThreads(response.data.threads);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages
        });
        setError('');
      } else {
        setError(response.message || "Erreur lors du chargement des discussions");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des discussions:", error);
      setError("Erreur lors du chargement des discussions");
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async threadId => {
    try {
      setLoading(true);
      const response = await getThreadById({ threadId });
      
      if (response.status === 200) {
        setSelectedThread(response.data);
        setError('');
      } else {
        setError(response.message || "Erreur lors du chargement de la discussion");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la discussion:", error);
      setError("Erreur lors du chargement de la discussion");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    try {
      if (!newThreadTitle.trim() || !newThreadContent.trim()) {
        setError('Veuillez remplir tous les champs');
        toast.error('Veuillez remplir tous les champs');
        return;
      }
      
      setLoading(true);
      const response = await createThread({
        title: newThreadTitle.trim(),
        content: newThreadContent.trim()
      });
      
      if (response.status === 201) {
        const threadId = response.data.id;
        await fetchThreads();
        await fetchThreadDetails(threadId);
        setNewThreadTitle('');
        setNewThreadContent('');
        setError('');
        toast.success('Discussion créée avec succès');
      } else {
        if (response.message?.includes('forbidden words')) {
          setShowDisciplinaryWarning(true);
          setDisciplinaryWarning(response.message);
          toast('Avertissement !', { icon: '⚠️' });
        } else {
          setError(response.message || "Erreur lors de la création de la discussion");
          toast.error(response.message || "Erreur lors de la création de la discussion");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de la discussion:", error);
      setError("Erreur lors de la création de la discussion");
      toast.error("Erreur lors de la création de la discussion");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    try {
      if (!newComment.trim() || !selectedThread) {
        setError('Veuillez écrire un commentaire');
        toast.error('Veuillez écrire un commentaire');
        return;
      }
      
      setLoading(true);
      const response = await addComment({
        threadId: selectedThread.id,
        content: newComment.trim()
      });
      
      if (response.status === 201) {
        await fetchThreadDetails(selectedThread.id);
        setNewComment('');
        setError('');
        toast.success('Commentaire publié avec succès');
      } else {
        if (response.message?.includes('forbidden words')) {
          setShowDisciplinaryWarning(true);
          setDisciplinaryWarning(response.message);
          toast('Avertissement !', { icon: '⚠️' });
        } else {
          setError(response.message || "Erreur lors de l'ajout du commentaire");
          toast.error(response.message || "Erreur lors de l'ajout du commentaire");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      setError("Erreur lors de l'ajout du commentaire");
      toast.error("Erreur lors de l'ajout du commentaire");
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
                        Vous avez enfreint notre charte de conduite en
                        partageant du contenu inapproprié. Ce comportement est
                        contraire à l&apos;article 4.2 de nos conditions
                        d&apos;utilisation.
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
                        Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur
                        ou souhaitez contester cette décision, veuillez
                        contacter notre équipe de modération à
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
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-colors"
                >
                  Je comprends et accepte
                </button>
              </div>
            </div>
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
