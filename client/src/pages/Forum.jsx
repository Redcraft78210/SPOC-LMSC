import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, User, Clock, MessageSquareText, Search, Filter, X, Plus, Trash2, Flag, Shield, AlertTriangle } from 'lucide-react';
import {
  getThreads,
  getThreadById,
  createThread,
  addComment,
  deleteThread,
  deleteComment
} from '../API/ForumCaller';

import {
  sendWarning,
  flagContent
} from '../API/ModerationCaller';

const Forum = ({ userRole }) => {
  // Existing state variables
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

  // Search and filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [authorFilter, setAuthorFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  
  // Moderation state variables
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'thread' or 'comment'
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [userToWarn, setUserToWarn] = useState(null);
  const [flaggedItems, setFlaggedItems] = useState(new Set());
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [itemToFlag, setItemToFlag] = useState(null);
  const [flagType, setFlagType] = useState(''); // 'thread' or 'comment'
  const [flagReason, setFlagReason] = useState('');
  
  useEffect(() => {
    fetchThreads();
  }, [pagination.currentPage, sortBy, authorFilter, activeSearchQuery, isSearching]); // Replace searchQuery with activeSearchQuery

  const fetchThreads = async () => {
    try {
      setLoading(true);
      console.log("Paramètres de recherche:", {
        page: pagination.currentPage,
        limit: 10,
        search: activeSearchQuery, // Use activeSearchQuery instead of searchQuery
        sortBy: sortBy,
        author: authorFilter || undefined
      });
      const response = await getThreads({
        page: pagination.currentPage,
        limit: 10,
        search: activeSearchQuery, // Use activeSearchQuery instead of searchQuery
        sortBy: sortBy,
        author: authorFilter || undefined,
        searchSubmitted: activeSearchQuery ? 'true' : 'false' // Add parameter for the backend
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
        toast.error(response.message || "Erreur lors du chargement des discussions");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des discussions:", error);
      setError("Erreur lors du chargement des discussions");
      toast.error("Erreur lors du chargement des discussions");
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
        toast.error(response.message || "Erreur lors du chargement de la discussion");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la discussion:", error);
      setError("Erreur lors du chargement de la discussion");
      toast.error("Erreur lors du chargement de la discussion");
    } finally {
      setLoading(false);
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
        setShowCreateThreadModal(false); // Fermer la modale après création réussie
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
    if (!newComment.trim()) {
      setError('Veuillez écrire un commentaire');
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    setLoading(true);
    try {
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

  // Modifie la fonction handleSearch pour mettre à jour activeSearchQuery
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery); // Set the active search query when search button is clicked
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setIsSearching(prev => !prev);
  };

  // Mettre à jour clearSearch pour réinitialiser activeSearchQuery aussi
  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearchQuery(''); // Clear the active search query
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setIsSearching(prev => !prev);
  };

  const handleFilterChange = (filter, value) => {
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when changing filters

    switch (filter) {
      case 'sort':
        setSortBy(value);
        break;
      case 'author':
        setAuthorFilter(value);
        break;
      default:
        break;
    }
  };

  // Moderation Functions
  const handleDeleteThread = async (threadId) => {
    try {
      setLoading(true);
      const response = await deleteThread({ threadId });
      
      if (response.status === 200) {
        toast.success("Discussion supprimée avec succès");
        // If in thread detail view, go back to list
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread(null);
        }
        // Refresh thread list
        await fetchThreads();
      } else {
        toast.error(response.message || "Erreur lors de la suppression de la discussion");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la discussion:", error);
      toast.error("Erreur lors de la suppression de la discussion");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    try {
      setLoading(true);
      const response = await deleteComment({ commentId });
      
      if (response.status === 200) {
        toast.success("Commentaire supprimé avec succès");
        // Refresh thread details to update comment list
        if (selectedThread) {
          await fetchThreadDetails(selectedThread.id);
        }
      } else {
        toast.error(response.message || "Erreur lors de la suppression du commentaire");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      toast.error("Erreur lors de la suppression du commentaire");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };
  
  const showDeleteConfirmation = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (deleteType === 'thread') {
      handleDeleteThread(itemToDelete);
    } else if (deleteType === 'comment') {
      handleDeleteComment(itemToDelete);
    }
  };
  
  const showWarningForm = (userId, username) => {
    setUserToWarn({ id: userId, username });
    setShowWarningModal(true);
  };
  
  // Rename the local function to avoid naming conflict
  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      toast.error("Veuillez saisir un message d'avertissement");
      return;
    }
    
    try {
      setLoading(true);
      // Now properly calling the imported sendWarning function
      const response = await sendWarning({
        userId: userToWarn.id,
        message: warningMessage.trim()
      });
      
      if (response.status === 201) {
        toast.success(`Avertissement envoyé à ${userToWarn.username}`);
        setShowWarningModal(false);
        setWarningMessage('');
        setUserToWarn(null);
      } else {
        toast.error(response.message || "Erreur lors de l'envoi de l'avertissement");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avertissement:", error);
      toast.error("Erreur lors de l'envoi de l'avertissement");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFlagContent = (id, type) => {
    setItemToFlag(id);
    setFlagType(type);
    setShowFlagModal(true);
  };
  
  const submitFlag = async () => {
    if (!flagReason.trim()) {
      toast.error("Veuillez indiquer une raison pour le signalement");
      return;
    }
    
    try {
      setLoading(true);
      const response = await flagContent({
        itemId: itemToFlag,
        itemType: flagType,
        reason: flagReason.trim()
      });
      
      if (response.status === 201) {
        // Ajouter l'élément aux éléments signalés localement
        setFlaggedItems(prev => new Set([...prev, itemToFlag]));
        toast.success(`${flagType === 'thread' ? 'Discussion' : 'Commentaire'} signalé pour révision`);
        setShowFlagModal(false);
        setFlagReason('');
        setItemToFlag(null);
        setFlagType('');
      } else {
        toast.error(response.message || "Erreur lors du signalement du contenu");
      }
    } catch (error) {
      console.error("Erreur lors du signalement du contenu:", error);
      toast.error("Erreur lors du signalement du contenu");
    } finally {
      setLoading(false);
    }
  };

  // Update the renderModerationControls function to include the flag button
  const renderModerationControls = (threadId, userId, username) => {
    if (userRole !== 'Administrateur') return null;
    
    const isFlagged = flaggedItems.has(threadId);
    
    return (
      <div className="flex items-center gap-2 mt-2 text-sm">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            showDeleteConfirmation(threadId, 'thread');
          }}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
          title="Supprimer cette discussion"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer</span>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            showWarningForm(userId, username);
          }}
          className="flex items-center gap-1 text-amber-600 hover:text-amber-800"
          title="Avertir l'utilisateur"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Avertir</span>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleFlagContent(threadId, 'thread');
          }}
          className={`flex items-center gap-1 ${isFlagged ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          title={isFlagged ? "Discussion déjà signalée" : "Signaler cette discussion pour révision"}
        >
          <Flag className="w-4 h-4" fill={isFlagged ? "currentColor" : "none"} />
          <span>{isFlagged ? "Signalé" : "Signaler"}</span>
        </button>
      </div>
    );
  };
  
  // Update the renderCommentModerationControls function similarly
  const renderCommentModerationControls = (commentId, userId, username) => {
    if (userRole !== 'Administrateur') return null;
    
    const isFlagged = flaggedItems.has(commentId);
    
    return (
      <div className="flex items-center gap-2 mt-2 text-sm">
        <button 
          onClick={() => showDeleteConfirmation(commentId, 'comment')}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer</span>
        </button>
        <button 
          onClick={() => showWarningForm(userId, username)}
          className="flex items-center gap-1 text-amber-600 hover:text-amber-800"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Avertir</span>
        </button>
        <button 
          onClick={() => handleFlagContent(commentId, 'comment')}
          className={`flex items-center gap-1 ${isFlagged ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <Flag className="w-4 h-4" fill={isFlagged ? "currentColor" : "none"} />
          <span>{isFlagged ? "Signalé" : "Signaler"}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Admin badge for administrators */}
      {userRole === 'Administrateur' && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            Mode modération
          </div>
        </div>
      )}
      
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

        {/* Disciplinary warning modal - existing code */}
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

        {/* Create Thread Modal */}
        {showCreateThreadModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-thread-heading"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateThreadModal(false)}
            onKeyDown={e => e.key === 'Escape' && setShowCreateThreadModal(false)}
          >
            <div
              className="mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl transition-all"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h2
                  id="create-thread-heading"
                  className="text-xl font-semibold text-gray-900"
                >
                  Nouvelle discussion
                </h2>

                <button
                  type="button"
                  onClick={() => setShowCreateThreadModal(false)}
                  className="ml-4 p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Fermer"
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
                    rows="6"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateThreadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateThread}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
              </div>
            </div>
          </div>
        )}

        {/* Remplacer la section "New thread" par un bouton */}
        <section className="mb-3 flex justify-end">
          <button
            onClick={() => setShowCreateThreadModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle discussion
          </button>
        </section>

        {!selectedThread ? (
          <>
            {/* Search and Filter Bar */}
            <section className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="min-w-[200px]">
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Trier par
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                    <option value="popular">Plus commentés</option>
                  </select>
                </div>

                <div className="min-w-[200px]">
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Auteur
                  </label>
                  <input
                    type="text"
                    id="author"
                    placeholder="Nom d'utilisateur"
                    value={authorFilter}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher dans les discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Rechercher
                </button>
              </form>

              {(searchQuery || sortBy !== 'newest' || authorFilter) && (
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-500 mr-2 flex items-center">
                    <Filter className="w-4 h-4 mr-1" /> Filtres actifs:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                        Recherche: {searchQuery}
                        <button onClick={clearSearch} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {sortBy !== 'newest' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Tri: {sortBy === 'oldest' ? 'Plus anciens' : 'Plus commentés'}
                      </span>
                    )}
                    {authorFilter && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Auteur: {authorFilter}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveSearchQuery(''); // Reset active search query
                        setSortBy('newest');
                        setAuthorFilter('');
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                        setIsSearching(prev => !prev);
                      }}
                      className="text-xs text-gray-600 underline hover:text-gray-900"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Thread list - existing code */}
            <section className="space-y-6">
              {loading && threads.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600">Chargement des discussions...</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <p className="text-gray-600 mb-2">Aucune discussion trouvée.</p>
                  <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche ou créez une nouvelle discussion.</p>
                </div>
              ) : (
                threads.map(thread => (
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
                    
                    {/* Add moderation controls */}
                    {renderModerationControls(thread.id, thread.User?.id, thread.User?.username)}
                  </article>
                ))
              )}
            </section>
            
            {/* Pagination - existing code */}
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
          // Thread detail view - existing code
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
                
                {/* Add thread moderation controls */}
                {userRole === 'Administrateur' && (
                  <div className="mt-3 flex gap-3">
                    <button 
                      onClick={() => showDeleteConfirmation(selectedThread.id, 'thread')}
                      className="flex items-center gap-1 px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer la discussion</span>
                    </button>
                    <button 
                      onClick={() => showWarningForm(selectedThread.User?.id, selectedThread.User?.username)}
                      className="flex items-center gap-1 px-3 py-1 text-white bg-amber-600 rounded-md hover:bg-amber-700"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Avertir l&apos;auteur</span>
                    </button>
                  </div>
                )}
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
                    
                    {/* Add comment moderation controls */}
                    {renderCommentModerationControls(comment.id, comment.User.id, comment.User.username)}
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
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {deleteType === 'thread' ? 'cette discussion' : 'ce commentaire'} ? 
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Warning modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Envoyer un avertissement à {userToWarn?.username}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d&apos;avertissement
              </label>
              <textarea
                value={warningMessage}
                onChange={e => setWarningMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Décrivez la raison de l'avertissement..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSendWarning}
                className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer l\'avertissement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Signaler le contenu
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du signalement
              </label>
              <textarea
                value={flagReason}
                onChange={e => setFlagReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Décrivez pourquoi ce contenu doit être révisé..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={submitFlag}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Signaler le contenu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Forum.propTypes = {
  userRole: PropTypes.string,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  })
};

export default Forum;
