import {
  X,
  Earth,
  Pencil,
  Trash2,
  ImageIcon,
  LaptopMinimal,
  Search,
  Loader2,
} from 'lucide-react';

import { jwtDecode } from 'jwt-decode';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Logo from '../Logo';
import clsx from 'clsx';

import { Toaster, toast } from 'react-hot-toast';
import { 
  getAvatar, 
  uploadAvatar, 
  deleteAvatar, 
  uploadIllustrationAvatar 
} from '../API/ProfileCaller';

/**
 * Composant permettant de sélectionner une photo de profil parmi des illustrations
 * prédéfinies ou depuis l'ordinateur de l'utilisateur.
 * 
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {Function} props.onUploadSuccess - Fonction appelée lorsque l'upload est réussi
 * @param {Function} props.onClose - Fonction appelée pour fermer le sélecteur
 * @param {string} props.token - Token d'authentification de l'utilisateur
 * @returns {JSX.Element} Le composant de sélection de photo de profil
 */
const ProfilePhotoSelector = ({ onUploadSuccess, onClose }) => {
  const tabs = [
    { id: 'illustrations', label: 'Illustrations', icon: ImageIcon },
    { id: 'computer', label: "Depuis l'ordinateur", icon: LaptopMinimal },
  ];

  const illustrationImages = [
    '/images/illus1.jpg',
    '/images/illus2.jpg',
    '/images/illus3.jpg',
    '/images/illus4.jpg',
    '/images/illus5.jpg',
    '/images/illus6.jpg',
    '/images/illus7.jpg',
    '/images/illus8.jpg',
    '/images/illus9.jpg',
    '/images/illus10.jpg',
    '/images/illus11.jpg',
    '/images/illus12.jpg',
  ];

  const extraImages = [
    '/images/extra1.jpg',
    '/images/extra2.jpg',
    '/images/extra3.jpg',
    '/images/extra4.jpg',
  ];

  const [activeTab, setActiveTab] = useState('illustrations');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredImages = illustrationImages.filter(src =>
    src.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Gère l'upload d'un fichier image comme avatar
   * 
   * @async
   * @param {File} file - Le fichier image à uploader
   * @throws {Error} Si l'upload échoue
   */
  const handleFileUpload = async file => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await uploadAvatar({ file });

      if (response.status >= 200 && response.status < 400) {

        onUploadSuccess(response.data);
      } else {
        throw new Error(response.message || "Erreur lors du téléchargement de l'avatar");
      }
    } catch (err) {
      console.error("Erreur lors du téléchargement de l'avatar:", err);
      setError(
        err.message || "Erreur lors du téléchargement de l'avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère la sélection d'une illustration comme avatar
   * 
   * @async
   * @param {string} imagePath - Le chemin de l'image sélectionnée
   * @throws {Error} Si la sélection échoue
   */
  const handleIllustrationSelect = async imagePath => {
    setIsLoading(true);
    setError(null);

    try {

      const response = await uploadIllustrationAvatar({ imagePath });
      
      if (response.status >= 200 && response.status < 400) {

        onUploadSuccess(response.data);
      } else {
        throw new Error(response.message || "Erreur lors du téléchargement de l'illustration");
      }
    } catch (err) {
      console.error("Erreur lors de la sélection de l'illustration:", err);
      setError(err.message || "Erreur lors de la sélection de l'illustration");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Composant de bouton avec icône
   * 
   * @component
   * @param {Object} props - Les propriétés du composant
   * @param {Function} props.icon - Composant d'icône à afficher
   * @param {Object} props.rest - Les autres propriétés à passer au bouton
   * @returns {JSX.Element} Un bouton avec une icône
   */
  const IconButton = ({ icon: Icon, ...props }) => (
    <button
      {...props}
      className="p-2 rounded-full bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 focus:outline-none transition-colors duration-200"
    >
      <Icon className="size-4" />
    </button>
  );

  IconButton.propTypes = {
    icon: PropTypes.elementType.isRequired,
  };

  /**
   * Composant d'onglet pour afficher les illustrations disponibles
   * 
   * @component
   * @param {Object} props - Les propriétés du composant
   * @param {string} props.search - Terme de recherche actuel
   * @param {Function} props.onSearchChange - Fonction appelée lors du changement de recherche
   * @param {Array<string>} props.filteredImages - Liste des images filtrées à afficher
   * @param {Array<string>} props.extraImages - Liste des images supplémentaires à afficher
   * @param {Function} props.onSelectImage - Fonction appelée lors de la sélection d'une image
   * @param {boolean} props.isLoading - Indique si le chargement est en cours
   * @returns {JSX.Element} L'onglet d'illustrations
   */
  const IllustrationsTab = ({
    search,
    onSearchChange,
    filteredImages,
    extraImages,
    onSelectImage,
    isLoading,
  }) => (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="size-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Recherchez dans les illustrations"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="size-8 text-blue-500 animate-spin" />
            <p className="mt-3 text-sm text-gray-400">Chargement en cours...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Illustrations recommandées
            </h3>
            <ImageGrid
              images={filteredImages}
              className="grid-cols-3 md:grid-cols-4 gap-3"
              onSelectImage={onSelectImage}
            />
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Plus d&apos;options
            </h3>
            <ImageGrid
              images={extraImages}
              className="grid-cols-2 md:grid-cols-4 gap-3"
              onSelectImage={onSelectImage}
            />
          </div>
        </div>
      )}
    </div>
  );

  IllustrationsTab.propTypes = {
    search: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    filteredImages: PropTypes.arrayOf(PropTypes.string).isRequired,
    extraImages: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectImage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
  };

  /**
   * Composant pour afficher une grille d'images
   * 
   * @component
   * @param {Object} props - Les propriétés du composant
   * @param {Array<string>} props.images - Liste des chemins d'images à afficher
   * @param {string} props.className - Classes CSS supplémentaires pour la grille
   * @param {Function} props.onSelectImage - Fonction appelée lors de la sélection d'une image
   * @returns {JSX.Element} Une grille d'images cliquables
   */
  const ImageGrid = ({ images, className, onSelectImage }) => (
    <div className={`grid ${className}`}>
      {images.map(src => (
        <div
          key={src}
          onClick={() => onSelectImage && onSelectImage(src)}
          className="group relative rounded-lg overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img
            src={src}
            alt=""
            className="w-full aspect-square object-cover transform transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium text-white">Sélectionner</span>
          </div>
        </div>
      ))}
    </div>
  );

  ImageGrid.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    className: PropTypes.string,
    onSelectImage: PropTypes.func,
  };

  /**
   * Composant d'onglet pour télécharger une image depuis l'ordinateur
   * 
   * @component
   * @param {Object} props - Les propriétés du composant
   * @param {Function} props.onFileUpload - Fonction appelée pour uploader le fichier
   * @param {boolean} props.isLoading - Indique si le chargement est en cours
   * @returns {JSX.Element} L'onglet d'upload de fichier
   */
  const FileUploadTab = ({ onFileUpload, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    /**
     * Gère le changement de fichier sélectionné
     * 
     * @param {Object} event - L'événement de changement
     */
    const handleFileChange = event => {
      const file = event.target.files[0];
      if (file) {
        processFile(file);
      }
    };

    /**
     * Traite le fichier sélectionné et crée une URL de prévisualisation
     * 
     * @param {File} file - Le fichier à traiter
     */
    const processFile = file => {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    };

    /**
     * Annule la sélection de fichier et libère l'URL de prévisualisation
     */
    const handleCancel = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    };

    /**
     * Enregistre le fichier sélectionné comme avatar
     * 
     * @async
     */
    const handleSave = async () => {
      if (selectedFile) {
        await onFileUpload(selectedFile);
        handleCancel();
      }
    };

    /**
     * Gère l'événement de survol lors du drag & drop
     * 
     * @param {DragEvent} e - L'événement de drag over
     */
    const handleDragOver = e => {
      e.preventDefault();
      e.stopPropagation();
    };

    /**
     * Gère l'événement d'entrée lors du drag & drop
     * 
     * @param {DragEvent} e - L'événement de drag enter
     */
    const handleDragEnter = e => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    /**
     * Gère l'événement de sortie lors du drag & drop
     * 
     * @param {DragEvent} e - L'événement de drag leave
     */
    const handleDragLeave = e => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    /**
     * Gère l'événement de dépôt lors du drag & drop
     * 
     * @param {DragEvent} e - L'événement de drop
     */
    const handleDrop = e => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];

        if (file.type.startsWith('image/')) {
          processFile(file);
        } else {
          toast.error('Le fichier doit être une image (JPG, PNG, WEBP)');
        }
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-96">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-2 flex items-center justify-center text-blue-500">
                <Loader2 className="size-8 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-300">Téléchargement en cours...</p>
          </div>
        ) : !previewUrl ? (
          <label
            className="w-full max-w-md cursor-pointer group"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'} 
              rounded-xl p-8 transition-all duration-300 
              group-hover:border-blue-500 group-hover:bg-blue-500/5 
              flex flex-col items-center`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className={`w-16 h-16 rounded-full ${isDragging ? 'bg-blue-500/30' : 'bg-blue-500/10'} 
                  flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300`}
                >
                  <LaptopMinimal className="size-8 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-200 font-medium">
                    {isDragging
                      ? "Déposez l'image ici"
                      : 'Glissez une image ou cliquez pour parcourir'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Formats supportés: JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </label>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg shadow-blue-500/30">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCancel}
                  className="bg-red-600/80 hover:bg-red-600 rounded-full p-2 text-white transition-colors duration-300"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 font-medium transition-colors duration-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors duration-300"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  FileUploadTab.propTypes = {
    onFileUpload: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-gray-900/80 backdrop-blur-md">
        <div className="w-full max-w-sm rounded-xl shadow-xl bg-gray-800/95 p-6 border border-red-500/30">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-red-500/20 p-3">
              <X className="size-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100">Erreur</h3>
            <p className="text-center text-gray-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors duration-300"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-gray-900/80 backdrop-blur-lg">
      <div className="w-full max-w-md rounded-xl shadow-2xl bg-gray-800 border border-gray-700 overflow-hidden">
        {/* Tabs Header */}
        <header className="bg-gray-900/50 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Changer de photo de profil
            </h2>
            <button
              onClick={() => onClose(false)}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
              aria-label="Fermer"
            >
              <X className="size-5 text-gray-400 hover:text-gray-200" />
            </button>
          </div>

          {/* Tabs navigation */}
          <nav className="mt-4 flex">
            {tabs.map(({ id, icon: Icon, label }) => {
              const isActive = id === activeTab;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-3 relative',
                    'transition-all duration-200 focus:outline-none',
                    {
                      'text-blue-500': isActive,
                      'text-gray-400 hover:text-gray-200': !isActive,
                    }
                  )}
                >
                  <Icon
                    className={clsx(
                      'size-5',
                      isActive ? 'text-blue-500' : 'text-gray-400'
                    )}
                  />
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Content Section */}
        <div className="p-4">
          {activeTab === 'illustrations' ? (
            <IllustrationsTab
              search={search}
              onSearchChange={setSearch}
              filteredImages={filteredImages}
              extraImages={extraImages}
              onSelectImage={handleIllustrationSelect}
              isLoading={isLoading}
            />
          ) : (
            <FileUploadTab
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

ProfilePhotoSelector.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  token: PropTypes.string.isRequired,
};

/**
 * Composant principal pour afficher la modal de gestion de photo de profil.
 * Permet de visualiser, modifier ou supprimer l'avatar de l'utilisateur.
 * 
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {Function} props.setShowProfilepictureModal - Fonction pour contrôler l'affichage de la modal
 * @param {Function} props.refreshAvatar - Fonction pour rafraîchir l'avatar dans le composant parent
 * @param {string} props.authToken - Token d'authentification de l'utilisateur
 * @returns {JSX.Element} La modal de gestion de photo de profil
 * @example
 * <PictureModal 
 *   setShowProfilepictureModal={setShowModal} 
 *   refreshAvatar={refreshUserAvatar} 
 *   authToken={userToken} 
 * />
 */
const PictureModal = ({
  setShowProfilepictureModal,
  refreshAvatar,
  authToken,
}) => {

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const decodedToken = jwtDecode(authToken);
  const user = decodedToken;

  /**
   * Récupère l'avatar de l'utilisateur depuis l'API et le met à jour dans le composant
   * 
   * @async
   * @throws {Error} Si la récupération de l'avatar échoue
   */
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        setIsLoading(true);

        if (avatarUrl) {
          URL.revokeObjectURL(avatarUrl);
        }

        const response = await getAvatar();
        
        if (response.status >= 200 && response.status < 400) {
          const imageUrl = URL.createObjectURL(response.data);
          setAvatarUrl(imageUrl);
        } else {
          throw new Error(response.message || 'Failed to fetch avatar');
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setAvatarUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();

    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [authToken]);

  /**
   * Supprime l'avatar de l'utilisateur après confirmation
   * 
   * @async
   * @throws {Error} Si la suppression de l'avatar échoue
   */
  const handleDeleteAvatar = async () => {
    if (
      !window.confirm(
        'Êtes-vous sûr de vouloir supprimer votre photo de profil ?'
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteAvatar();

      if (response.status >= 200 && response.status < 400) {
        setAvatarUrl(null);
        refreshAvatar();
        toast.success('Votre photo de profil a été supprimée avec succès.');
      } else {
        throw new Error(response.message || "Erreur lors de la suppression de l'avatar");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'avatar:", err);
      setError(
        err.message || "Erreur lors de la suppression de l'avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ferme le sélecteur de photo de profil
   */
  const handleCloseSelector = () => {
    setShowProfilePhotoSelector(false);
  };

  /**
   * Gère la réussite de l'upload d'un avatar en récupérant et affichant le nouvel avatar
   * 
   * @async
   * @throws {Error} Si la mise à jour de l'avatar échoue
   */
  const handleAvatarUploadSuccess = async () => {
    try {
      const response = await getAvatar();

      if (response.status >= 200 && response.status < 400) {
        if (avatarUrl) {
          URL.revokeObjectURL(avatarUrl);
        }
        const newAvatarUrl = URL.createObjectURL(response.data);
        setAvatarUrl(newAvatarUrl);
      } else {
        throw new Error(response.message || 'Failed to update avatar');
      }

      refreshAvatar();
      setShowProfilePhotoSelector(false);
      toast.success('Votre photo de profil a été mise à jour avec succès.');
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'aperçu de l'avatar:",
        error
      );

      refreshAvatar();
      setShowProfilePhotoSelector(false);
      toast.success('Votre photo de profil a été mise à jour avec succès.');
    }
  };

  if (showProfilePhotoSelector) {
    return (
      <ProfilePhotoSelector
        onUploadSuccess={handleAvatarUploadSuccess}
        onClose={handleCloseSelector}
        token={authToken}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-md flex items-center justify-center z-50">
      <Toaster position="top-center" />
      {/* Carte principale */}
      <div className="bg-gray-800 text-gray-100 w-full max-w-sm rounded-xl shadow-lg p-4 md:p-6 relative">
        {/* Bouton de fermeture */}
        <X
          className="absolute top-4 left-4 cursor-pointer"
          onClick={() => setShowProfilepictureModal(false)}
        />
        <h1 className="text-center text-xl font-bold mb-1 flex items-center justify-center gap-2">
          Compte <Logo className="w-30 h-10 inline-block" fillColor={'white'} />
        </h1>

        {/* Sous-titre */}
        <h2 className="text-2xl font-medium mb-2 mt-4">Photo de profil</h2>

        {/* Description */}
        <p className="text-sm mb-4 text-gray-300">
          Votre photo de profil aide les autres utilisateurs à vous reconnaître
          et vous permet de savoir quand vous êtes connecté à votre compte
        </p>

        {/* Section d'info : Visible par tous */}
        <div className="flex items-center mb-4 rounded border border-gray-600 w-fit p-1 hover:bg-gray-700">
          <Earth className="w-4 h-4 mr-2" />
          <span className="text-sm text-gray-200 px-2 py-1 mr-2">
            Visible par tous
          </span>
        </div>

        {/* Zone de la photo de profil */}
        <div className="flex flex-col items-center mb-4">
          {isLoading ? (
            <div className="h-65 w-65 rounded-full border-2 bg-gray-700 mx-auto mb-4 flex items-center justify-center">
              <Loader2 className="size-8 text-blue-500 animate-spin" />
            </div>
          ) : !avatarUrl ? (
            <div className="h-65 w-65 rounded-full border-2 bg-yellow-500 mx-auto mb-4 flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-800">
                {user.name.charAt(0) || ''}
              </span>
            </div>
          ) : (
            <div className="h-65 w-65 rounded-full border-2 mx-auto mb-4 overflow-hidden">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={() => {

                  setAvatarUrl(null);
                }}
              />
            </div>
          )}
        </div>

        {/* Affichage d'erreurs */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Modifier l'élément"
            onClick={() => setShowProfilePhotoSelector(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">Modifier</span>
          </button>

          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Supprimer l'élément"
            onClick={handleDeleteAvatar}
            disabled={isLoading || !avatarUrl}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

PictureModal.propTypes = {
  authToken: PropTypes.string.isRequired,
  setShowProfilepictureModal: PropTypes.func.isRequired,
  refreshAvatar: PropTypes.func,
};

export default PictureModal;
