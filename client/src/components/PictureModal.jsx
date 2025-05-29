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
import axios from 'axios';
import PropTypes from 'prop-types';
import Logo from '../Logo';
import clsx from 'clsx';

import { Toaster, toast } from 'react-hot-toast';

// Configuration de l'URL de base pour les appels API
const API_BASE_URL = 'https://localhost:8443/api';

const ProfilePhotoSelector = ({ onUploadSuccess, token, onClose }) => {
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

  const handleFileUpload = async file => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_BASE_URL}/avatars`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Appeler le callback pour informer le parent qu'un nouvel avatar a été téléchargé
      onUploadSuccess(response.data);
    } catch (err) {
      console.error("Erreur lors du téléchargement de l'avatar:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors du téléchargement de l'avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleIllustrationSelect = async imagePath => {
    setIsLoading(true);
    setError(null);

    try {
      // Convertir l'image sélectionnée en fichier
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], 'illustration.jpg', { type: 'image/jpeg' });

      // Utiliser la même logique que pour l'upload de fichier
      await handleFileUpload(file);
    } catch (err) {
      console.error("Erreur lors de la sélection de l'illustration:", err);
      setError("Erreur lors de la sélection de l'illustration");
    } finally {
      setIsLoading(false);
    }
  };

  // Composant d'icône réutilisable
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

  // Composant d'onglet Illustrations mis à jour
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

  // Mise à jour de la grille d'images
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

  // Mise à jour du composant FileUploadTab
  const FileUploadTab = ({ onFileUpload, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = event => {
      const file = event.target.files[0];
      if (file) {
        processFile(file);
      }
    };

    const processFile = file => {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    };

    const handleCancel = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    };

    const handleSave = async () => {
      if (selectedFile) {
        await onFileUpload(selectedFile);
        handleCancel();
      }
    };

    const handleDragOver = e => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = e => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = e => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = e => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Vérifier que c'est bien une image
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

  // Afficher un message d'erreur si nécessaire
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

const PictureModal = ({
  setShowProfilepictureModal,
  refreshAvatar,
  authToken,
}) => {
  // Ajoutez l'état local pour stocker temporairement l'URL de l'avatar dans ce composant
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const decodedToken = jwtDecode(authToken);
  const user = decodedToken;

  // Load user avatar when component mounts
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/avatars`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setAvatarUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();

    // Clean up the object URL when component unmounts
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [authToken]);

  // Fonction pour supprimer l'avatar
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
      await axios.delete(`${API_BASE_URL}/avatars`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Réinitialiser l'avatar local
      setAvatarUrl(null);

      // Informer le parent de rafraîchir l'avatar
      refreshAvatar();

      // Notification de succès
      toast.success('Votre photo de profil a été supprimée avec succès.');
    } catch (err) {
      console.error("Erreur lors de la suppression de l'avatar:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l'avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSelector = () => {
    setShowProfilePhotoSelector(false);
  };

  // Fonction appelée lorsqu'un nouvel avatar est téléchargé avec succès
  const handleAvatarUploadSuccess = async () => {
    try {
      // Mettre à jour l'avatar local immédiatement
      const response = await fetch(
        `${API_BASE_URL}/avatars?t=${new Date().getTime()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        // Révoquer l'ancienne URL avant de la remplacer
        if (avatarUrl) {
          URL.revokeObjectURL(avatarUrl);
        }
        const newAvatarUrl = URL.createObjectURL(blob);
        setAvatarUrl(newAvatarUrl);
      }

      // Informer le parent (Dashboard) de rafraîchir l'avatar
      refreshAvatar();
      setShowProfilePhotoSelector(false);

      // Notification de succès
      toast.success('Votre photo de profil a été mise à jour avec succès.');
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'aperçu de l'avatar:",
        error
      );
      // Même en cas d'erreur pour l'aperçu, informer le parent
      refreshAvatar();
      setShowProfilePhotoSelector(false);
      toast.success('Votre photo de profil a été mise à jour avec succès.');
    }
  };

  // Afficher le sélecteur de photo si demandé
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
      <Toaster />
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
                  // En cas d'erreur de chargement, afficher l'initiale
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
