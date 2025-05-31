import { useState, useRef } from 'react';
import PublicNavbar from '../../components/PublicComp/PublicNavbar';
import Footer from '../../components/PublicComp/Footer';
import { Paperclip, X } from 'lucide-react';
import { sendContactMessage } from '../../API/ContactCaller';
import toast, { Toaster } from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    motif: '',
    objet: '',
    message: '',
  });

  const [attachments, setAttachments] = useState([]);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);

    // Check file size limit (10MB per file)
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);

    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} fichier(s) dépassent la limite de 10 Mo`);
    }

    // Add valid files to attachments
    setAttachments([...attachments, ...validFiles]);
  };

  const removeAttachment = index => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('loading');

    // Vérifier si l'utilisateur mentionne des pièces jointes mais n'en a pas ajouté
    if (attachments.length === 0 && checkForAttachmentMention(formData.message)) {
      const confirmSend = window.confirm(
        "Vous semblez mentionner des pièces jointes dans votre message, mais aucun fichier n'a été ajouté. Souhaitez-vous quand même envoyer le message sans pièces jointes?"
      );

      if (!confirmSend) {
        setStatus(''); // Reset status
        return;
      }
    }

    try {
      // Use the sendContactMessage function from ContactCaller
      const response = await sendContactMessage({
        name: formData.name,
        email: formData.email,
        motif: formData.motif,
        objet: formData.objet,
        message: formData.message,
        attachments: attachments
      });

      if (response.status >= 200 && response.status < 300) {
        setStatus('success');
        toast.success('Votre message a été envoyé avec succès !');
        setFormData({ name: '', email: '', motif: '', objet: '', message: '' });
        setAttachments([]); // Clear attachments
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
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Votre message"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              ></textarea>
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