/**
 * @fileoverview
 * Component for the public contact page that allows users to send messages with attachments.
 * Features include a rich text editor, file attachment system, and attachment mention detection.
 */

import { useState, useEffect, useRef } from 'react';
import PublicNavbar from '../../components/PublicComp/PublicNavbar';
import Footer from '../../components/PublicComp/Footer';
import { Paperclip, X } from 'lucide-react';
import { sendContactMessage } from '../../API/ContactCaller';
import toast, { Toaster } from 'react-hot-toast';

import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

/**
 * Contact page component with form submission and file attachment capabilities
 * 
 * @returns {JSX.Element} The contact page with form and supporting UI elements
 */
const Contact = () => {
  /**
   * Form data state containing user input fields
   * @type {Object}
   * @property {string} name - User's full name
   * @property {string} email - User's email address
   * @property {string} motif - Contact reason/category
   * @property {string} objet - Subject of the message
   * @property {string} message - Content of the message
   */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    motif: '',
    objet: '',
    message: '',
  });
  
  /**
   * Reference to the rich text editor instance
   * @type {React.RefObject}
   */
  const editorRef = useRef(null);

  /**
   * Array of file attachments to be sent with the message
   * @type {File[]}
   */
  const [attachments, setAttachments] = useState([]);
  
  /**
   * Current status of the form submission
   * @type {string} - Empty string, 'loading', 'success', or 'error'
   */
  const [status, setStatus] = useState('');
  
  /**
   * Reference to the hidden file input element
   * @type {React.RefObject}
   */
  const fileInputRef = useRef(null);

  /**
   * Regular expressions to detect mentions of attachments in message text
   * @type {RegExp[]}
   */
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
   * Checks if the text contains any mention of attachments based on regex patterns
   * 
   * @param {string} text - The text to check for attachment mentions
   * @returns {boolean} True if text contains attachment mentions, false otherwise
   */
  const checkForAttachmentMention = (text) => {
    return attachmentRegexList.some(regex => regex.test(text));
  };

  /**
   * Handles changes to form input fields
   * 
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - The change event
   */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Processes file selection for attachments with size validation
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   */
  const handleFileChange = e => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);

    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} fichier(s) dépassent la limite de 10 Mo`);
    }

    setAttachments([...attachments, ...validFiles]);
  };

  /**
   * Removes a specific attachment from the attachments array
   * 
   * @param {number} index - The index of the attachment to remove
   */
  const removeAttachment = index => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  /**
   * Handles form submission with attachment validation
   * 
   * @async
   * @param {React.FormEvent} e - The form submission event
   * @throws {Error} When the API call to send the message fails
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('loading');

    if (attachments.length === 0 && checkForAttachmentMention(formData.message)) {
      const confirmSend = window.confirm(
        "Vous semblez mentionner des pièces jointes dans votre message, mais aucun fichier n'a été ajouté. Souhaitez-vous quand même envoyer le message sans pièces jointes?"
      );

      if (!confirmSend) {
        setStatus('');
        return;
      }
    }

    const editorContent = editorRef.current?.getInstance().getMarkdown() || '';

    try {
      const response = await sendContactMessage({
        name: formData.name,
        email: formData.email,
        motif: formData.motif,
        objet: formData.objet,
        message: editorContent,
        attachments: attachments
      });

      if (response.status >= 200 && response.status < 300) {
        setStatus('success');
        toast.success('Votre message a été envoyé avec succès !');
        setFormData({ name: '', email: '', motif: '', objet: '', message: '' });
        setAttachments([]);
      } else {
        console.error("Erreur lors de l'envoi du formulaire :", response.message);
        setStatus('error');
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error);
      setStatus('error');
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  /**
   * Sets up drag and drop functionality for the editor
   * Handles file drops with size validation and special handling for images
   */
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
    <div className="min-h-screen bg-gray-50">
      {/* Add Toaster component */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#e5f7ee',
              color: '#0f766e',
              border: '1px solid #0f766e',
            },
            duration: 5000,
          },
          error: {
            style: {
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #b91c1c',
            },
            duration: 5000,
          },
        }}
      />

      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Contactez-Nous</h1>
          <p className="text-xl mb-8">
            Une question, une suggestion ou un problème ? Nous sommes là pour
            vous aider.
          </p>
        </div>
      </header>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Envoyez-nous un message
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@example.com"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de contact
              </label>
              <select
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>
                  Sélectionnez un motif
                </option>
                <option value="information">Information générale</option>
                <option value="support">Support technique</option>
                <option value="service_client">Service client</option>
                <option value="rgpd">Faire valoir mes droits RGPD</option>
                <option value="partenariat">Partenariat</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objet du message
              </label>
              <input
                type="text"
                name="objet"
                value={formData.objet}
                onChange={handleChange}
                placeholder="Sujet de votre message"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pièces jointes (optionnel)
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
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 flex items-center gap-2"
              >
                <Paperclip size={16} />
                Ajouter des pièces jointes
              </button>
              <p className="text-xs text-gray-500 mt-1">Limite de 10 Mo par fichier</p>

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
                        <span className="text-sm text-gray-700 truncate">
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

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Nos Coordonnées
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Adresse
              </h3>
              <p className="text-gray-600">
                2 avenue jean jaurès, 78210 Saint-Cyr-l&apos;École
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Téléphone
              </h3>
              <p className="text-gray-600">+33 1 23 45 67 89</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Email
              </h3>
              <p className="text-gray-600">support@spoc-lmsc.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;