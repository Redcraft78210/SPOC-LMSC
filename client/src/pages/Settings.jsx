/**
 * @fileoverview
 * Interface pour gérer les paramètres utilisateur,
 * y compris les informations de profil, les préférences de sécurité et les options de confidentialité. 
 * Elle inclut également des fonctionnalités pour mettre à jour les profils utilisateurs, 
 * gérer les modifications non enregistrées et administrer les tutoriels utilisateur.
 * 
 */

import { useState, useEffect, lazy, Suspense } from 'react'; 
import PropTypes from 'prop-types';
import {
  getUserProfile,
  updateUserProfile,
} from '../API/ProfileCaller';

import { toast, Toaster } from 'react-hot-toast';

import {
  Globe,
  Lock,
  TrashIcon,
  CogIcon,
  UserCircleIcon,
  Loader2,
} from 'lucide-react';

import PictureModal from '../components/PictureModal';
import { useTutorial } from '../contexts/TutorialContext';


const SecurityTab = lazy(() => import('../components/settings/SecurityTab'));
const PrivacyTab = lazy(() => import('../components/settings/PrivacyTab'));

/**
 * Composant de gestion des paramètres utilisateur permettant de modifier le profil,
 * la sécurité et les préférences de confidentialité.
 * 
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.authToken - Token d'authentification de l'utilisateur
 * @param {Function} props.refreshAvatar - Fonction pour rafraîchir l'avatar de l'utilisateur
 * @param {string} [props.userAvatar] - URL de l'avatar de l'utilisateur
 * @param {boolean} props.loadingAvatar - Indicateur de chargement de l'avatar
 * @returns {JSX.Element} Interface des paramètres utilisateur
 */
const Settings = ({ authToken, refreshAvatar, userAvatar, loadingAvatar }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [dataSharing, setDataSharing] = useState({
    analytics: true,
    personalizedAds: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfilepictureModal, setShowProfilepictureModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [user, setUser] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    avatar: '',
    twoFAEnabled: false,
  });

  const { resetAllTutorials } = useTutorial();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        
        if (response.status === 200) {
          setUser({
            name: response.data.name,
            surname: response.data.surname,
            username: response.data.username,
            email: response.data.email,
            twoFAEnabled: response.data.twoFAEnabled,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      }
    };
    
    fetchUserProfile();
  }, [authToken]);

  /**
   * Gère les changements dans les champs de formulaire
   * 
   * @function handleInputChange
   * @param {Object} e - Événement de changement
   * @param {string} e.target.id - Identifiant du champ modifié
   * @param {string} e.target.value - Nouvelle valeur du champ
   */
  const handleInputChange = e => {
    const { id, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [id]: value,
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Change l'onglet actif et affiche une confirmation si des modifications non enregistrées existent
   * 
   * @function handleTabChange
   * @param {string} tab - Identifiant de l'onglet à afficher ('general', 'security', ou 'privacy')
   */
  const handleTabChange = tab => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir changer d’onglet ?'
      );
      if (!confirmChange) return;
    }
    setErrors({});
    setActiveTab(tab);
    setHasUnsavedChanges(false);
  };

  window.onbeforeunload = function () {
    if (hasUnsavedChanges) {
      return 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter cette page ?';
    }
  };

  /**
   * Valide les données du formulaire utilisateur
   * 
   * @function validateForm
   * @returns {boolean} Vrai si les données sont valides, faux sinon
   */
  const validateForm = () => {
    const newErrors = {};
    if (!user.name) newErrors.name = 'Le prénom est requis.';
    if (!user.surname) newErrors.surname = 'Le nom de famille est requis.';
    if (!user.username) newErrors.username = 'Le nom d’utilisateur est requis.';
    if (!user.email) newErrors.email = 'L’email est requis.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      newErrors.email = 'L’email n’est pas valide.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Met à jour le profil utilisateur avec les données du formulaire
   * 
   * @async
   * @function updateUserProfileHandler
   * @throws {Error} Erreur lors de la mise à jour du profil
   */
  const updateUserProfileHandler = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      setLoading(true);
      const response = await updateUserProfile({
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email
      });
      
      if (response.status === 200) {
        setHasUnsavedChanges(false);
        toast.success('Profil mis à jour avec succès.');
      } else {
        toast.error('Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error('Une erreur est survenue. Veuillez vérifier les messages d’erreur.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Affiche le contenu correspondant à l'onglet actif
   * 
   * @function renderContent
   * @returns {JSX.Element} Contenu de l'onglet sélectionné
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            <h2
              id="profile-section"
              className="text-xl font-semibold text-gray-800 flex items-center space-x-2"
            >
              <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
              <span>Profil</span>
            </h2>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="text-center mb-4">
                  <button
                    className="absolute -top-1 -right-1 z-10 cursor-pointer border border-blue-400 p-1 rounded-full bg-black text-white"
                    onClick={() => setShowProfilepictureModal(true)}
                  >
                    <CogIcon className="h-5 w-5" />
                  </button>

                  {/* User avatar or placeholder */}
                  {loadingAvatar ? (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-2 bg-gray-200 mx-auto flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                    </div>
                  ) : !userAvatar ? (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-2 bg-yellow-500 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {user.name ? user.name.charAt(0).toUpperCase() : ''}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 md:border-4 border-black-300 mx-auto"
                      onError={() => refreshAvatar()}
                    />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mt-1">
                Cliquez sur l&apos;icône pour modifier votre photo de profil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                  value={user.name || ''}
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom
                </label>
                <input
                  id="surname"
                  type="text"
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                  value={user.surname || ''}
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom d’utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Votre nom d’utilisateur"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                  value={user.username || ''}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                  value={user.email || ''}
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <Suspense fallback={<div className="p-4 text-center"><Spinner /></div>}>
            <SecurityTab 
              user={user} 
              setUser={setUser} 
              handleInputChange={handleInputChange} 
            />
          </Suspense>
        );

      case 'privacy':
        return (
          <Suspense fallback={<div className="p-4 text-center"><Spinner /></div>}>
            <PrivacyTab
              dataSharing={dataSharing}
              setDataSharing={setDataSharing}
              handleInputChange={handleInputChange}
            />
          </Suspense>
        );

      default:
        return null;
    }
  };

  /**
   * Composant d'indicateur de chargement
   * 
   * @function Spinner
   * @returns {JSX.Element} Animation de chargement
   */
  const Spinner = () => (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <>
      <Toaster />

      {loading && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}

      {showProfilepictureModal && (
        <PictureModal
          setShowProfilepictureModal={setShowProfilepictureModal}
          authToken={authToken}
          refreshAvatar={refreshAvatar}
        />
      )}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>

          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {['general', 'security', 'privacy'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {tab === 'general' && <CogIcon className="h-5 w-5" />}
                {tab === 'security' && <Lock className="h-5 w-5" />}
                {tab === 'privacy' && <Globe className="h-5 w-5" />}
                <span>
                  {tab === 'general' && 'Général'}
                  {tab === 'security' && 'Sécurité'}
                  {tab === 'privacy' && 'Confidentialité'}
                </span>
              </button>
            ))}
          </div>

          {renderContent()}

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <ul className="text-red-600 text-sm">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-red-600 flex items-center space-x-2">
                <TrashIcon className="h-6 w-6" />
                <span>Zone de danger</span>
              </h2>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex flex-col justify-space-around space-y-4 ">
                  <div>
                    <h3 className="font-medium text-red-800">
                      Supprimer le compte
                    </h3>
                    <p className="text-sm text-red-600">
                      Cette action est irréversible et entraînera la suppression
                      définitive de toutes vos données. Votre compte sera
                      automatiquement supprimé 30 jours après votre demande,
                      pour des raisons de sécurité. Si vous vous reconnectez
                      avant cette échéance, la suppression sera annulée.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-fit"
                  >
                    Supprimer le compte
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showDeleteModal && (
            <div className="fixed inset-0 backdrop-filter backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-red-600 mb-4">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer définitivement votre compte
                  ? Toutes vos données seront perdues.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);

                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Confirmer la suppression
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              onClick={() => {
                setHasUnsavedChanges(false);
                window.location.reload();
              }}
            >
              Annuler
            </button>
            <button
              className={`px-6 py-2 rounded-lg text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={updateUserProfileHandler}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>

          {/* Tutorials Section */}
          <section className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tutoriels</h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={resetAllTutorials}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Réinitialiser tous les tutoriels
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Cette action vous permettra de revoir tous les tutoriels comme si vous visitiez l&apos;application pour la première fois.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

/**
 * Validation des types de propriétés pour le composant Settings
 * 
 * @type {Object}
 */
Settings.propTypes = {
  authToken: PropTypes.string.isRequired,
  refreshAvatar: PropTypes.func.isRequired,
  userAvatar: PropTypes.string,
  loadingAvatar: PropTypes.bool.isRequired,
};

export default Settings;
