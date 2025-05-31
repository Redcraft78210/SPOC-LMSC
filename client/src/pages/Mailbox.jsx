import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  getInboxMessages,
  getSentMessages,
  getTrashMessages,
  getMessage,
  markAsRead,
  moveToTrash,
  downloadAttachment,
  sendMessage,
  // restoreFromTrash,
  deleteMessage as permanentlyDeleteMessage,
  getAvailableRecipients
} from '../API/MailboxCaller';
import {
  Inbox,
  Send,
  Trash2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Download,
  X,
  Clock,
  AlertTriangle,
  User,
  UserCheck,
  ShieldAlert,
  Users,
  Menu,
  File,
  FileText,
  Image,
  Music,
  Video,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const Mailbox = ({ role, onClose }) => {
  const [view, setView] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [replyData, setReplyData] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
  });

  // Add missing state variables
  const [downloadingAttachments, setDownloadingAttachments] = useState({});
  const [loadingMessageDetails, setLoadingMessageDetails] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter options
  const [filters, setFilters] = useState({
    unread: false,
    hasAttachments: false,
    fromContact: false,
  });

  const fileInputRef = useRef(null);

  const getEndpointForView = useCallback(() => {
    switch (view) {
      case 'inbox':
        return getInboxMessages;
      case 'sent':
        return getSentMessages;
      case 'trash':
        return getTrashMessages;
      default:
        return getInboxMessages;
    }
  }, [view]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const fetchFunction = getEndpointForView();
      const response = await fetchFunction({
        page: pagination.currentPage,
        limit: 20,
        filters
      });

      if (response.status === 200) {
        setMessages(response.data.messages);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalMessages: response.data.total
        });
      } else {
        console.error("Error fetching messages:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, getEndpointForView]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMessageSelect = async messageId => {
    try {
      setLoadingMessageDetails(true);
      const response = await getMessage({ messageId });

      if (response.status === 200) {
        setSelectedMessage(response.data);
        if (!response.data.read && view === 'inbox') {
          await markAsRead({ messageId });
          fetchMessages(); // Recharger pour mettre à jour les badges non lus
        }
      } else {
        console.error("Error fetching message details:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du message:", error);
    } finally {
      setLoadingMessageDetails(false);
      // Fermer le menu mobile automatiquement lorsqu'un message est sélectionné
      setMobileMenuOpen(false);
    }
  };

  const deleteMessageHandler = async messageId => {
    try {
      setDeletingMessage(true);
      let response;

      if (view === 'trash') {
        response = await permanentlyDeleteMessage({ messageId });
      } else {
        response = await moveToTrash({ messageId });
      }

      if (response.status === 200) {
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
        fetchMessages();
      } else {
        console.error("Error deleting message:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
    } finally {
      setDeletingMessage(false);
    }
  };

  const downloadAttachmentHandler = async (attachmentId, filename) => {
    try {
      setDownloadingAttachments(prev => ({ ...prev, [attachmentId]: true }));
      const response = await downloadAttachment({ attachmentId });

      if (response && response.status === 200) {
        // Téléchargement du fichier
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Safe access to response message with fallback
        const errorMessage = response?.message || "Unknown error";
        console.error("Error downloading attachment:", errorMessage);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement de la pièce jointe:", error);
    } finally {
      setDownloadingAttachments(prev => ({ ...prev, [attachmentId]: false }));
    }
  };

  const filteredMessages = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return messages.filter(msg =>
      [msg.subject, msg.sender?.name, msg.recipient?.name, msg.content]
        .filter(Boolean)
        .some(field => field.toLowerCase().includes(searchLower))
    );
  }, [messages, searchQuery]);

  const ComposeMail = () => {
    const [recipients, setRecipients] = useState([]);
    const [availableRecipients, setAvailableRecipients] = useState([]);
    const [subject, setSubject] = useState(replyData?.subject || '');
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [sending, setSending] = useState(false);
    const [recipientType, setRecipientType] = useState('individual'); // individual, all-admins, all-teachers, all-students
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const recipientsInitialized = useRef(false);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const searchInputRef = useRef(null);

    // Expressions régulières pour détecter les mentions de pièces jointes
    const attachmentRegexList = [
      /ci-joint/i,
      /pièce[s]? jointe[s]?/i,
      /fichier[s]? joint[s]?/i,
      /attachement[s]?/i,
      /en annexe/i,
      /joint[s]? à ce mail/i,
      /joint[s]? à ce message/i,
      /joint[s]? à cet email/i,
      /veuillez trouver/i,
      /vous trouverez.*joint/i,
      /je vous envoie.*fichier/i,
      /document[s]? joint[s]?/i,
      /photo[s]? jointe[s]?/i,
      /image[s]? jointe[s]?/i,
      /pdf joint/i,
      /joint.*pdf/i,
      /joint.*excel/i,
      /joint.*document/i,
    ];

    // Fonction pour vérifier si le contenu mentionne des pièces jointes
    const checkForAttachmentMention = (text) => {
      return attachmentRegexList.some(regex => regex.test(text));
    };

    const fetchAvailableRecipients = useCallback(async () => {
      try {
        setLoadingRecipients(true);
        const response = await getAvailableRecipients({
          type: recipientType
        });

        if (response.status === 200) {
          setAvailableRecipients(response.data || []);
        } else {
          console.error("Error fetching recipients:", response.message);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des destinataires:", error);
      } finally {
        setLoadingRecipients(false);
      }
    }, [recipientType]);

    useEffect(() => {
      fetchAvailableRecipients();
    }, [fetchAvailableRecipients]);

    // Add effect to handle reply data initialization
    useEffect(() => {
      if (
        replyData &&
        availableRecipients.length > 0 &&
        !recipientsInitialized.current
      ) {
        // Pre-fill subject from replyData
        setSubject(replyData.subject);

        // Pre-select recipient if it exists in available recipients
        const replyRecipient = availableRecipients.find(
          r => r.id === replyData.recipientId
        );
        if (replyRecipient) {
          setRecipients([replyRecipient]);
          setRecipientType('individual');
          recipientsInitialized.current = true;
        }
      }
    }, [replyData, availableRecipients]);

    // Close suggestions on outside click
    useEffect(() => {
      const handleClickOutside = event => {
        if (
          searchInputRef.current &&
          !searchInputRef.current.contains(event.target)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleFileChange = e => {
      const files = Array.from(e.target.files);

      // Check file size limit (10MB per file)
      const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
      const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);

      if (invalidFiles.length > 0) {
        toast.error(
          `${invalidFiles.length} fichier(s) dépassent la limite de 10 Mo`
        );
      }

      // Add valid files to attachments
      setAttachments([...attachments, ...validFiles]);
    };

    const removeAttachment = index => {
      setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSearchChange = e => {
      setSearchQuery(e.target.value);
      setShowSuggestions(true); // Show suggestions when typing
    };

    const handleRecipientSelect = input => {
      const userId = input.toString();
      const selectedUser = availableRecipients.find(
        user => user.id.toString() === userId
      );
      if (selectedUser) {
        setRecipients(prevRecipients => {
          // Check if the user is already selected
          if (!prevRecipients.some(r => r.id === selectedUser.id)) {

            return [...prevRecipients, selectedUser];
          }
          return prevRecipients;
        });
      }
      setSearchQuery(''); // Clear search query after selection
      setShowSuggestions(false); // Hide suggestions after selection
    };

    const handleSpecialRecipientSelect = type => {
      setRecipientType(type);
      setRecipients([]); // Clear individual recipients when selecting a special group
    };

    const handleSubmit = async e => {
      e.preventDefault();

      if (recipients.length === 0 && recipientType === 'individual') {
        toast.error("Veuillez sélectionner au moins un destinataire");
        return;
      }

      if (!subject.trim()) {
        toast.error("Veuillez saisir un objet");
        return;
      }

      if (!content.trim()) {
        toast.error("Veuillez saisir un message");
        return;
      }

      // Vérifier si l'utilisateur mentionne des pièces jointes mais n'en a pas ajouté
      if (attachments.length === 0 && checkForAttachmentMention(content)) {
        const confirmSend = window.confirm(
          "Vous semblez mentionner des pièces jointes dans votre message, mais aucun fichier n'a été ajouté. Souhaitez-vous quand même envoyer le message sans pièces jointes?"
        );

        if (!confirmSend) {
          return;
        }
      }

      setSending(true);

      try {
        const formData = new FormData();

        // Ajouter les destinataires
        recipients.forEach(recipient => {
          formData.append('recipients[]', recipient.id);
        });

        console.log("FormData recipients:", recipients.map(r => r.id));
        console.log("FormData subject:", subject.trim());
        console.log("FormData content:", content.trim());
        console.log("FormData attachments:", attachments);

        formData.append('subject', subject.trim());
        formData.append('content', content.trim());

        // Si c'est une réponse, ajouter l'ID du message auquel on répond
        if (replyData) {
          formData.append('replyTo', replyData.id);
        }
        // Si le type de destinataire est individuel, ajouter le type
        if (recipientType === 'individual') {
          formData.append('recipientType', 'individual');
        }
        // Sinon, ajouter le type de destinataire spécial
        if (recipientType === 'all-students') {
          formData.append('recipientType', 'all-students');
        } else if (recipientType === 'all-teachers') {
          formData.append('recipientType', 'all-teachers');
        } else if (recipientType === 'all-admins') {
          formData.append('recipientType', 'all-admins');
        }

        // Ajouter les pièces jointes
        Array.from(attachments).forEach(file => {
          formData.append('attachments', file);
        });

        const response = await sendMessage(formData);

        if (response.status === 201) {
          toast.success("Message envoyé avec succès");
          closeComposeModal();
          fetchMessages();
        } else {
          toast.error(response.message || "Erreur lors de l'envoi du message");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        toast.error("Erreur lors de l'envoi du message");
      } finally {
        setSending(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9940 p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          <div className="p-3 sm:p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Nouveau Message
              </h2>
              <button
                onClick={closeComposeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
          >
            {/* Recipient Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de destinataire
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSpecialRecipientSelect('individual')}
                  className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 ${recipientType === 'individual'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  <User size={14} className="sm:size-6" />
                  Individuel
                </button>

                {role !== 'Etudiant' ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleSpecialRecipientSelect('all-students')
                      }
                      className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 ${recipientType === 'all-students'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      <Users size={14} className="sm:size-6" />
                      Tous les étudiants
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSpecialRecipientSelect('all-teachers')
                      }
                      className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 ${recipientType === 'all-teachers'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      <UserCheck size={14} className="sm:size-6" />
                      Tous les professeurs
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSpecialRecipientSelect('all-admins')}
                    className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 ${recipientType === 'all-admins'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    <ShieldAlert size={14} className="sm:size-6" />
                    Tous les administrateurs
                  </button>
                )}
              </div>
            </div>

            {/* Individual Recipients Selection */}
            {recipientType === 'individual' && (
              <div className="mb-4">
                <label
                  htmlFor="recipients"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {(() => {
                    switch (recipients.length) {
                      case 0:
                        return 'Aucun destinataire sélectionné';
                      case 1:
                        return '1 destinataire sélectionné';
                      default:
                        return `${recipients.length} destinataires sélectionnés`;
                    }
                  })()}
                  {loadingRecipients && (
                    <span className="ml-2 inline-flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 text-blue-600"
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
                    </span>
                  )}
                </label>

                {/* Selected Recipients Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipients.map(recipient => (
                    <div
                      key={recipient.id}
                      className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md"
                    >
                      <span className="text-xs sm:text-sm">
                        {recipient.name} {recipient.surname}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setRecipients(
                            recipients.filter(r => r.id !== recipient.id)
                          )
                        }
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Search Input and Results */}
                <div className="relative" ref={searchInputRef}>
                  <input
                    type="text"
                    placeholder="Rechercher des destinataires..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingRecipients}
                  />

                  {showSuggestions && searchQuery && !loadingRecipients && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
                      {availableRecipients
                        .filter(
                          user =>
                            !recipients.some(r => r.id === user.id) && // Filter out already selected recipients
                            (user.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                              user.surname
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()))
                        )
                        .map(user => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              handleRecipientSelect(user.id);
                              setSearchQuery('');
                            }}
                          >
                            <div className="font-medium">
                              {user.name} {user.surname}
                            </div>
                          </div>
                        ))}

                      {availableRecipients.filter(
                        user =>
                          !recipients.some(r => r.id === user.id) &&
                          (user.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                            user.surname
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()))
                      ).length === 0 && (
                          <div className="p-2 text-gray-500">
                            Aucun destinataire trouvé
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="mb-4">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sujet
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Content */}
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message
              </label>
              <textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Attachments */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pièces jointes
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 flex items-center gap-2 text-sm"
              >
                <Paperclip size={16} />
                Ajouter des pièces jointes
              </button>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeComposeModal}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 text-sm"
                disabled={sending}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 text-sm"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // When closing compose modal, clear reply data
  const closeComposeModal = () => {
    setShowComposeModal(false);
    setReplyData(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9950">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[60vh] h-[95vh] overflow-hidden mx-2 sm:mx-4 flex flex-col">
        <Toaster position="top-center" reverseOrder={false} />
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-gray-600"
              onClick={toggleMobileMenu}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Messagerie</h1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            title="Fermer"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Hidden on mobile by default */}
          <div className={`${mobileMenuOpen ? 'absolute inset-0 z-30 bg-white' : 'hidden md:flex'
            } w-full md:w-64 md:static bg-white border-r border-gray-200 flex-col`}>
            {/* Mobile Menu Header */}
            {mobileMenuOpen && (
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h2 className="font-medium">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Compose Button */}
            <div className="p-3 sm:p-4">
              <button
                onClick={() => {
                  setShowComposeModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} />
                Nouveau Message
              </button>
            </div>

            {/* Folders */}
            <nav className="flex-1 overflow-y-auto">
              <ul>
                <li>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setView('inbox');
                      setSelectedMessage(null);
                      setPagination({ ...pagination, currentPage: 1 });
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${view === 'inbox'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <Inbox size={18} />
                    <span>Boîte de réception</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setView('sent');
                      setSelectedMessage(null);
                      setPagination({ ...pagination, currentPage: 1 });
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${view === 'sent'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <Send size={18} />
                    <span>Messages envoyés</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setView('trash');
                      setSelectedMessage(null);
                      setPagination({ ...pagination, currentPage: 1 });
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${view === 'trash'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <Trash2 size={18} />
                    <span>Corbeille</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Filters */}
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Filtres
              </h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.unread}
                    onChange={() => {
                      setFilters({ ...filters, unread: !filters.unread });
                      setMobileMenuOpen(false);
                    }}
                    className="rounded text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">Non lus</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasAttachments}
                    onChange={() => {
                      setFilters({
                        ...filters,
                        hasAttachments: !filters.hasAttachments,
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="rounded text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Avec pièces jointes
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.fromContact}
                    onChange={() => {
                      setFilters({
                        ...filters,
                        fromContact: !filters.fromContact,
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="rounded text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Formulaire de contact
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Messages List & View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Messages List */}
            <div
              className={`${selectedMessage ? 'hidden md:flex' : 'flex'
                } flex-col w-full md:w-1/2 lg:w-2/5 bg-white border-r border-gray-200`}
            >
              {/* Search Bar */}
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher des messages..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full p-2 pl-8 sm:pl-10 pr-2 sm:pr-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Search
                    className="absolute left-2 sm:left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
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
                      <p className="mt-2 text-gray-600 text-sm">
                        Chargement des messages...
                      </p>
                    </div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Inbox className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Aucun message trouvé</p>
                    </div>
                  </div>
                ) : (
                  filteredMessages.map(message => (
                    <button
                      key={message.id}
                      onClick={() => handleMessageSelect(message.id)}
                      className={`w-full text-left p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 ${!message.read && view === 'inbox' ? 'bg-blue-50' : ''
                        } ${selectedMessage?.id === message.id ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`text-xs sm:text-sm font-medium ${!message.read && view === 'inbox'
                            ? 'text-blue-700 font-semibold'
                            : 'text-gray-800'
                            }`}
                        >
                          {view === 'sent'
                            ? message.recipient?.name
                            : message.sender?.name}
                        </h3>
                        <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {message.subject}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {message.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                        {message.fromContactForm && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Contact
                          </span>
                        )}
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Paperclip size={10} className="mr-1" />
                              {message.attachments.length}
                            </span>
                          )}
                        {!message.read && view === 'inbox' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Non lu
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-200">
                <span className="text-xs sm:text-sm text-gray-500">
                  {pagination.totalMessages} message
                  {pagination.totalMessages !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        currentPage: Math.max(1, pagination.currentPage - 1),
                      })
                    }
                    disabled={pagination.currentPage === 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="sm:size-8" />
                  </button>
                  <span className="mx-2 text-xs sm:text-sm text-gray-600">
                    Page {pagination.currentPage} sur{' '}
                    {pagination.totalPages || 1}
                  </span>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        currentPage: Math.min(
                          pagination.totalPages,
                          pagination.currentPage + 1
                        ),
                      })
                    }
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} className="sm:size-8" />
                  </button>
                </div>
              </div>
            </div>

            {/* Message Detail View */}
            {selectedMessage ? (
              <div className={`flex-1 flex flex-col bg-white ${selectedMessage ? 'block md:flex' : 'hidden md:flex'}`}>
                {/* Message Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-start relative">
                  {loadingMessageDetails && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
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
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-medium text-gray-900 truncate">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex flex-col flex-wrap gap-x-4 gap-y-1 mt-2">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <span className="font-medium text-gray-800 mr-1">
                          De :
                        </span>
                        {selectedMessage.fromContactForm ? <span className="truncate">Formulaire de contact</span> : <span className="truncate">{selectedMessage.sender?.name}</span>}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <span className="font-medium text-gray-800 mr-1">
                          À :
                        </span>
                        <span className="truncate">{selectedMessage.recipient?.name}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Clock size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => deleteMessageHandler(selectedMessage.id)}
                      className={`p-2 text-gray-500 hover:text-red-600 ${deletingMessage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      disabled={deletingMessage}
                      title="Supprimer"
                    >
                      {deletingMessage ? (
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
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
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                  {/* Alert for virus scan results */}
                  {selectedMessage.attachments &&
                    selectedMessage.attachments.some(
                      att => att.scanStatus === 'infected'
                    ) && (
                      <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                        <AlertTriangle
                          className="text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5"
                          size={18}
                        />
                        <div>
                          <p className="text-sm text-red-800 font-medium">
                            Attention : Fichiers potentiellement dangereux
                            détectés
                          </p>
                          <p className="text-xs sm:text-sm text-red-600 mt-1">
                            Certaines pièces jointes ont été identifiées comme
                            potentiellement malveillantes et ont été mises en
                            quarantaine.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Message Body */}
                  <div className="prose max-w-none text-sm sm:text-base">
                    {selectedMessage.content
                      .split('\n')
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>

                  {/* Attachments */}
                  {selectedMessage.Attachments &&
                    selectedMessage.Attachments.length > 0 && (
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">
                          Pièces jointes ({selectedMessage.Attachments.length})
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {selectedMessage.Attachments.map(attachment => (
                            <div
                              key={attachment.id}
                              className={`flex items-center justify-between p-2 sm:p-3 rounded-md ${attachment.scanStatus === 'infected'
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-gray-50 border border-gray-200'
                                }`}
                            >
                              <div className="flex items-center min-w-0">
                                <Paperclip
                                  size={16}
                                  className={`flex-shrink-0 ${attachment.scanStatus === 'infected'
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                    }`}
                                />
                                <div className="ml-2 sm:ml-3 overflow-hidden">
                                  <p
                                    className={`text-xs sm:text-sm font-medium truncate ${attachment.scanStatus === 'infected'
                                      ? 'text-red-700'
                                      : 'text-gray-900'
                                      }`}
                                  >
                                    {attachment.filename}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                                    <span className="text-gray-700 px-1.5 py-0.5 rounded text-xs mr-2">
                                      {(() => {
                                        switch (attachment.mimeType.split('/')[0]) {
                                          case "application":
                                            return (
                                              <File size={15} className="mr-1" />
                                            );

                                          case "audio":
                                            return (
                                              <Music size={15} className="mr-1" />
                                            );
                                          case "video":
                                            return (
                                              <Video size={15} className="mr-1" />
                                            );
                                          case "text":
                                            return (
                                              <FileText size={15} className="mr-1" />
                                            );
                                          case "image":
                                            return (
                                              <Image size={15} className="mr-1" />
                                            );
                                          default:
                                            return (
                                              <Paperclip size={15} className="mr-1" />
                                            );
                                        }
                                      })()}
                                    </span>
                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>

                              {attachment.scanStatus === 'clean' ? (
                                <button
                                  onClick={() =>
                                    downloadAttachmentHandler(
                                      attachment.id,
                                      attachment.filename
                                    )
                                  }
                                  className={`ml-2 sm:ml-3 p-1.5 text-blue-700 hover:bg-blue-50 rounded-md flex items-center flex-shrink-0 ${downloadingAttachments?.[attachment.id]
                                    ? 'cursor-wait opacity-70'
                                    : ''
                                    }`}
                                  disabled={
                                    downloadingAttachments?.[attachment.id]
                                  }
                                >
                                  {downloadingAttachments?.[attachment.id] ? (
                                    <svg
                                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
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
                                  ) : (
                                    <Download size={16} />
                                  )}
                                </button>
                              ) : attachment.scanStatus === 'infected' ? (
                                <span className="ml-2 sm:ml-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-red-100 text-red-700 text-xs flex items-center gap-1 flex-shrink-0">
                                  <AlertTriangle size={12} className="mr-0.5" />
                                  Infecté
                                </span>
                              ) : (
                                <span className="ml-2 sm:ml-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-yellow-100 text-yellow-800 text-xs flex items-center gap-1 flex-shrink-0">
                                  <Clock size={12} className="mr-0.5" />
                                  Analyse...
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Set the reply data that will be used by ComposeMail
                      setReplyData({
                        subject: `Re: ${selectedMessage.subject}`,
                        recipientId: selectedMessage.sender?.id,
                        originalMessage: selectedMessage,
                      });
                      setShowComposeModal(true);
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Send size={14} className="sm:size-6" />
                    Répondre
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 items-center justify-center bg-white hidden md:flex">
                <p className="text-gray-500 text-sm sm:text-base">
                  Sélectionnez un message pour le lire
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compose Modal */}
        {showComposeModal && <ComposeMail />}
      </div>
    </div>
  );
};

Mailbox.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  role: PropTypes.oneOf(['admin', 'teacher', 'student']).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Mailbox;
