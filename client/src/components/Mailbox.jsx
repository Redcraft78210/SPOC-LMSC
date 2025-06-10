import { useState, useEffect, useRef, useCallback, useMemo, useTransition } from 'react';
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
import { Editor } from '@toast-ui/react-editor';

import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor.css';

/**
 * Composant de messagerie permettant aux utilisateurs de gérer leurs emails
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.user - Informations sur l'utilisateur connecté
 * @param {string|number} props.user.id - Identifiant de l'utilisateur
 * @param {string} props.user.name - Prénom de l'utilisateur
 * @param {string} props.user.surname - Nom de famille de l'utilisateur
 * @param {string} props.user.email - Email de l'utilisateur
 * @param {'Administrateur'|'Professeur'|'Etudiant'} props.role - Rôle de l'utilisateur
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du composant
 * @returns {JSX.Element} Interface de messagerie
 */
const Mailbox = ({ role, onClose, user }) => {
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


  const [isPending, startTransition] = useTransition();


  const [downloadingAttachments, setDownloadingAttachments] = useState({});
  const [loadingMessageDetails, setLoadingMessageDetails] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);


  const [filters, setFilters] = useState({
    unread: false,
    hasAttachments: false,
    fromContact: false,
  });

  const fileInputRef = useRef(null);

  /**
   * Récupère la fonction d'API correspondant à la vue actuelle
   * @function
   * @param {string} view - Vue active ('inbox', 'sent', 'trash')
   * @returns {Function} Fonction d'API pour récupérer les messages
   */
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

  /**
   * Récupère les messages depuis l'API en fonction de la vue active
   * @async
   * @function
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
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

        startTransition(() => {
          setMessages(response.data.messages);
          setPagination({
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalMessages: response.data.total
          });
        });
      } else {
        console.error("Error fetching messages:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, getEndpointForView, startTransition]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, refreshKey]);

  /**
   * Gère la sélection d'un message et le marque comme lu si nécessaire
   * @async
   * @function
   * @param {string|number} messageId - ID du message à sélectionner
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
  const handleMessageSelect = async messageId => {
    try {

      setSelectedMessage(null);


      const messageToUpdate = messages.find(msg => msg.id === messageId);
      if (messageToUpdate && !messageToUpdate.read && view === 'inbox') {

        startTransition(() => {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === messageId ? { ...msg, read: true } : msg
            )
          );
        });


        markAsRead({ messageId }).catch(error => {
          console.error("Erreur lors du marquage comme lu:", error);
        });
      }


      startTransition(() => {
        setLoadingMessageDetails(true);
      });

      const response = await getMessage({ messageId });

      if (response.status === 200) {
        startTransition(() => {
          setSelectedMessage(response.data);
        });
      } else {
        console.error("Error fetching message details:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du message:", error);
    } finally {
      startTransition(() => {
        setLoadingMessageDetails(false);
        setMobileMenuOpen(false);
      });
    }
  };

  /**
   * Supprime un message ou le déplace vers la corbeille selon la vue active
   * @async
   * @function
   * @param {string|number} messageId - ID du message à supprimer
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue
   */
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

  /**
   * Télécharge une pièce jointe
   * @async
   * @function
   * @param {string|number} attachmentId - ID de la pièce jointe
   * @param {string} filename - Nom du fichier
   * @returns {Promise<void>}
   * @throws {Error} Si le téléchargement échoue
   */
  const downloadAttachmentHandler = async (attachmentId, filename) => {
    try {
      setDownloadingAttachments(prev => ({ ...prev, [attachmentId]: true }));
      const response = await downloadAttachment({ attachmentId });

      if (response && response.status === 200) {

        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();


        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {

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

  /**
   * Composant pour composer un nouveau message ou répondre à un message existant
   * @component
   * @returns {JSX.Element} Formulaire de composition de message
   */
  const ComposeMail = () => {
    const [recipients, setRecipients] = useState([]);
    const [availableRecipients, setAvailableRecipients] = useState([]);
    const [subject, setSubject] = useState(replyData?.subject || '');
    const [attachments, setAttachments] = useState([]);
    const [sending, setSending] = useState(false);
    const [recipientType, setRecipientType] = useState('individual');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const recipientsInitialized = useRef(false);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const searchInputRef = useRef(null);
    const editorRef = useRef(null);


    useEffect(() => {
      if (recipients.length > 1 && recipientType !== 'multiple') {
        setRecipientType('multiple');
      }
    }, [recipients, recipientType]);


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


    /**
     * Vérifie si le texte contient des mentions de pièces jointes
     * @function
     * @param {string} text - Contenu du message
     * @returns {boolean} Vrai si le texte mentionne des pièces jointes
     */
    const checkForAttachmentMention = (text) => {
      return attachmentRegexList.some(regex => regex.test(text));
    };

    /**
     * Récupère la liste des destinataires disponibles
     * @async
     * @function
     * @returns {Promise<void>}
     * @throws {Error} Si la requête échoue
     */
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


    useEffect(() => {
      if (
        replyData &&
        availableRecipients.length > 0 &&
        !recipientsInitialized.current
      ) {

        setSubject(replyData.subject);


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

    /**
     * Gère le changement de fichiers lors de l'ajout de pièces jointes
     * @function
     * @param {Event} e - Événement de changement
     * @returns {void}
     */
    const handleFileChange = e => {
      const files = Array.from(e.target.files);


      const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
      const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);

      if (invalidFiles.length > 0) {
        toast.error(
          `${invalidFiles.length} fichier(s) dépassent la limite de 10 Mo`
        );
      }


      setAttachments([...attachments, ...validFiles]);
    };

    /**
     * Supprime une pièce jointe du formulaire
     * @function
     * @param {number} index - Index de la pièce jointe à supprimer
     * @returns {void}
     */
    const removeAttachment = index => {
      setAttachments(attachments.filter((_, i) => i !== index));
    };

    /**
     * Gère les changements dans le champ de recherche de destinataires
     * @function
     * @param {Event} e - Événement de changement
     * @returns {void}
     */
    const handleSearchChange = e => {
      setSearchQuery(e.target.value);
      setShowSuggestions(true);
    };

    /**
     * Ajoute un destinataire sélectionné à la liste
     * @function
     * @param {string|number} userId - ID du destinataire
     * @returns {void}
     */
    const handleRecipientSelect = input => {
      const userId = input.toString();
      const selectedUser = availableRecipients.find(
        user => user.id.toString() === userId
      );

      if (selectedUser) {
        setRecipients(prevRecipients => {

          if (!prevRecipients.some(r => r.id === selectedUser.id)) {
            return [...prevRecipients, selectedUser];
          }
          return prevRecipients;
        });
      }

      setSearchQuery('');
      setShowSuggestions(false);
    };

    /**
     * Définit le type de destinataire spécial (tous les étudiants, tous les professeurs, etc.)
     * @function
     * @param {string} type - Type de destinataire spécial
     * @returns {void}
     */
    const handleSpecialRecipientSelect = type => {
      if (type !== recipientType) {
        setRecipientType(type);
        setRecipients([]);
      }
    };

    /**
     * Envoie le message
     * @async
     * @function
     * @param {Event} e - Événement de soumission
     * @returns {Promise<void>}
     * @throws {Error} Si l'envoi échoue
     */
    const handleSubmit = async e => {
      e.preventDefault();


      const editorContent = editorRef.current?.getInstance().getMarkdown() || '';

      if (recipients.length === 0 && recipientType === 'individual') {
        toast.error("Veuillez sélectionner au moins un destinataire");
        return;
      }

      if (!subject.trim()) {
        toast.error("Veuillez saisir un objet");
        return;
      }

      if (!editorContent.trim()) {
        toast.error("Veuillez saisir un message");
        return;
      }


      if (attachments.length === 0 && checkForAttachmentMention(editorContent)) {
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


        recipients.forEach(recipient => {
          formData.append('recipients[]', recipient.id);
        });

        console.log("FormData recipients:", recipients.map(r => r.id));
        console.log("FormData subject:", subject.trim());
        console.log("FormData content:", editorContent.trim());
        console.log("FormData attachments:", attachments);

        formData.append('recipientType', recipientType);
        formData.append('subject', subject.trim());
        formData.append('content', editorContent.trim());


        if (replyData) {
          formData.append('replyTo', replyData.id);
        }


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


    useEffect(() => {
      if (replyData && editorRef.current) {

        const originalContent = replyData.originalMessage?.content || '';
        const quoteContent = originalContent
          .split('\n')
          .map(line => `> ${line}`)
          .join('\n');

        const replyTemplate = `\n\n---\n${quoteContent}`;


        editorRef.current.getInstance().setMarkdown(replyTemplate);
      }
    }, [replyData]);


    useEffect(() => {
      if (editorRef.current) {
        const editorInstance = editorRef.current.getInstance();

        const dropZone = document.querySelector('.toastui-editor-defaultUI');
        if (dropZone) {
          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
          });

          dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
          });

          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            if (e.dataTransfer.files.length) {
              const files = Array.from(e.dataTransfer.files);

              const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);


              const imageFiles = validFiles.filter(file => file.type.startsWith('image/'));
              const otherFiles = validFiles.filter(file => !file.type.startsWith('image/'));


              if (otherFiles.length > 0) {
                setAttachments(prev => [...prev, ...otherFiles]);
                toast.success(`${otherFiles.length} fichier(s) ajouté(s) aux pièces jointes`);
              }


              if (imageFiles.length > 0) {

                imageFiles.forEach(file => {
                  const reader = new FileReader();
                  reader.onload = (e) => {

                    editorInstance.insertImage({
                      src: e.target.result,
                      alt: file.name
                    });
                  };
                  reader.readAsDataURL(file);
                });

                toast.success(`${imageFiles.length} image(s) insérée(s) dans l'éditeur`);
              }
            }
          });
        }


        return () => {
          if (dropZone) {
            dropZone.removeEventListener('dragover', () => { });
            dropZone.removeEventListener('dragleave', () => { });
            dropZone.removeEventListener('drop', () => { });
          }
        };
      }
    }, [editorRef.current]);

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
                {recipientType === 'multiple' ? (
                  <button
                    type="button"
                    onClick={() => handleSpecialRecipientSelect('multiple')}
                    className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 ${recipientType === 'multiple'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    <User size={14} className="sm:size-6" />
                    Multiple
                  </button>) : (
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
                  </button>)}

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
            {(recipientType === 'individual' || recipientType === 'multiple') && (
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
                            !recipients.some(r => r.id === user.id) &&
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

            {/* Remplacer le textarea par Toast UI Editor */}
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message
              </label>
              <div className="border border-gray-300 rounded-md">
                <Editor
                  ref={editorRef}
                  initialValue="<p></p>"
                  previewStyle="tab"
                  height="300px"
                  initialEditType="wysiwyg"
                  useCommandShortcut={true}
                  toolbarItems={[
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link'],
                    ['code', 'codeblock']
                  ]}
                />
              </div>
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


  const closeComposeModal = () => {
    setShowComposeModal(false);
    setReplyData(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleTabClick = (newView) => {

    if (view === newView) {
      setLoading(true);

      setRefreshKey(prev => prev + 1);
      return;
    }

    setMessages([]);


    setLoading(true);
    setView(newView);
    setSelectedMessage(null);
    setPagination({ ...pagination, currentPage: 1 });
    setMobileMenuOpen(false);
  };

  /**
   * Composant pour afficher le contenu d'un message avec Toast UI Viewer
   * @component
   * @param {Object} props - Propriétés du composant
   * @param {string} props.content - Contenu du message à afficher
   * @returns {JSX.Element} Visualiseur de contenu
   */
  const ToastViewer = ({ content }) => {
    const viewerRef = useRef();

    useEffect(() => {
      const viewerInstance = new Viewer({
        el: viewerRef.current,
        initialValue: content,
      });

      return () => {

        viewerInstance.destroy();
      };
    }, [content]);
    return <div ref={viewerRef}></div>;
  };

  ToastViewer.propTypes = {
    content: PropTypes.string.isRequired,
  };

  /**
   * Composant squelette pour l'affichage pendant le chargement d'un message dans la liste
   * @component
   * @returns {JSX.Element} Animation de chargement pour un message
   */
  const MessageSkeleton = () => {
    return (
      <div className="w-full p-3 sm:p-4 border border-gray-100 animate-pulse">
        <div className="flex items-start justify-between mb-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
        <div className="flex mt-2 gap-1">
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
    );
  };


  /**
   * Composant squelette pour l'affichage pendant le chargement des détails d'un message
   * @component
   * @returns {JSX.Element} Animation de chargement pour les détails d'un message
   */
  const MessageDetailSkeleton = () => {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-3 sm:p-4 border-b border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex-1 p-3 sm:p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Validation des types de propriétés pour le composant Mailbox
   * @type {Object}
   */
  Mailbox.propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      surname: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,
    role: PropTypes.oneOf(['Administrateur', 'Professeur', 'Etudiant']).isRequired,
    onClose: PropTypes.func.isRequired,
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9950">
      {isPending && (
        <div className="fixed top-2 right-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center gap-2 z-[9960]">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Actualisation...
        </div>
      )}
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
                    onClick={() => handleTabClick('inbox')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${view === 'inbox' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                  >
                    <Inbox size={18} />
                    <span>Boîte de réception</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabClick('sent')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${view === 'sent' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                  >
                    <Send size={18} />
                    <span>Messages envoyés</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabClick('trash')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${view === 'trash' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
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

              {/* Messages List - Optimisé pour éviter le flickering */}
              <div className="flex-1 overflow-y-auto">
                {loading && (

                  <div className="space-y-1">
                    {Array(5).fill(0).map((_, index) => (
                      <MessageSkeleton key={index} />
                    ))}
                  </div>
                )}
                {filteredMessages.length === 0 ? (
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
                      className={`w-full text-left p-3 sm:p-4 border border-gray-100 hover:bg-gray-50 
        ${!message.read && view === 'inbox' ? 'bg-blue-50' : ''} 
        ${selectedMessage?.id === message.id ? 'bg-indigo-100 border-l-4 border-indigo-500' : ''}`}
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
            {loadingMessageDetails ? (

              <MessageDetailSkeleton />
            ) : selectedMessage ? (
              <div className={`flex-1 flex flex-col bg-white ${selectedMessage ? 'block md:flex' : 'hidden md:flex'}`}>
                {/* Message Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-start relative">
                  {/* Remove the loading overlay that was here */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-medium text-gray-900 truncate">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex flex-col flex-wrap gap-x-4 gap-y-1 mt-2">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        {!selectedMessage.fromContactForm && (
                          <>
                            <span className="font-medium text-gray-800 mr-1">De :</span>
                            <span className="truncate">{selectedMessage.sender.email === user.email ? "Vous" : selectedMessage.sender?.name}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        {["all-students", "all-admins", "all-teachers"].includes(selectedMessage?.recipientType) ? (
                          <span className="font-medium text-gray-800 mr-1">
                            À :{" "}
                            {(() => {
                              switch (selectedMessage?.recipientType) {
                                case "all-students":
                                  return "Tous les étudiants";
                                case "all-admins":
                                  return "Tous les administrateurs";
                                case "all-teachers":
                                  return "Tous les enseignants";
                                default:
                                  return "Inconnu";
                              }
                            })()}
                          </span>
                        ) : (
                          <>
                            <span className="font-medium text-gray-800 mr-1">À :</span>
                            {(() => {
                              const userIsRecipient = selectedMessage.recipients?.some(r => r?.email === user.email);


                              const displayedRecipients = [
                                ...(userIsRecipient ? ["Vous"] : []),
                                ...(selectedMessage.recipients?.map(r => r?.name || "") ?? []),
                              ];






                              const filteredRecipients = displayedRecipients.filter(name => name && name !== user.name && name !== "");

                              return filteredRecipients.map((name, index) => (
                                <span key={index} className="truncate">
                                  {name}
                                  {index < filteredRecipients.length - 1 && <>,&nbsp;</>}
                                </span>
                              ));
                            })()}
                          </>
                        )}

                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Clock size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">
                          <span className="truncate">
                            {new Date(selectedMessage.createdAt).toLocaleString(
                              navigator?.language || 'fr-FR',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              }
                            )}
                          </span>
                        </span>
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
                    <ToastViewer content={selectedMessage.content} />
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
  role: PropTypes.oneOf(['Administrateur', 'Professeur', 'Etudiant']).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Mailbox;
