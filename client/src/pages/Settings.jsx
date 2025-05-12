import { useState, useEffect, useRef } from 'react'; // Add useRef
import PropTypes from 'prop-types'; // Import prop-types
import axios from 'axios'; // Import axios pour les requêtes API
import { toast, Toaster } from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import { jwtDecode } from 'jwt-decode';

import {
  Globe,
  Lock,
  TrashIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Loader2,
} from 'lucide-react';

import PictureModal from '../components/PictureModal';
import {
  LoadCanvasTemplate,
  loadCaptchaEnginge as loadCaptchaEngine,
  validateCaptcha,
} from 'react-simple-captcha';

const API_URL = 'https://localhost:8443/api';

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
  const [twoFADigits, setTwoFADigits] = useState(['', '', '', '', '', '']);
  const digitsRefs = useRef([]);
  const [qrCodeData, setQrCodeData] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [authStep, setAuthStep] = useState('initial');
  const [captchaValue, setCaptchaValue] = useState('');
  const [countEchec2FACode, setCountEchec2FACode] = useState(0);
  const [tempToken, setTempToken] = useState(null);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    if (countEchec2FACode >= 2) {
      loadCaptchaEngine(6, '#f9fafb'); // Recharge le CAPTCHA après plusieurs échecs
    }
  }, [countEchec2FACode]);

  const handleInputChange = () => {
    setHasUnsavedChanges(true);
  };

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

  const Switch = ({ checked, onChange, disabled }) => {
    return (
      <button
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  Switch.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );

  Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  const [user, setUser] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    avatar: '',
    twoFAEnabled: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Début du chargement
      try {
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const userFromDb = response.data;
        setUser(userFromDb);
        setTwoFactorAuth(userFromDb.twoFAEnabled);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Erreur lors de la récupération du profil utilisateur');
      } finally {
        setLoading(false); // Fin du chargement
      }
    };
    fetchUser();
  }, [authToken]);

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

  const updateUserProfile = async () => {
    if (!validateForm()) return;

    setLoading(true); // Début du chargement
    setErrors({}); // Clear previous errors
    try {
      await axios.put(
        `${API_URL}/users/profile`,
        {
          name: user.name,
          email: user.email,
          username: user.username,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast.success('Profil mis à jour avec succès.');
      setHasUnsavedChanges(false);
    } catch (error) {
      if (error.response) {
        console.error('Erreur serveur:', error.response.data);
        setErrors({
          server:
            error.response.data.message || 'Une erreur serveur est survenue.',
        });
      } else if (error.request) {
        console.error('Erreur réseau:', error.request);
        setErrors({
          network:
            'Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.',
        });
      } else {
        console.error('Erreur inconnue:', error.message);
        setErrors({
          unknown: 'Une erreur inconnue est survenue. Veuillez réessayer.',
        });
      }
      toast.error(
        'Une erreur est survenue. Veuillez vérifier les messages d’erreur.'
      );
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  const handleDigitChange = (index, value) => {
    // Vérifier que la valeur est un chiffre unique ou vide
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...twoFADigits];
    newDigits[index] = value;
    setTwoFADigits(newDigits);

    // Si une valeur est entrée (pas vide), passer au champ suivant
    if (value && index < 5) {
      digitsRefs.current[index + 1].focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    // Pour les touches de navigation
    if (e.key === 'Backspace') {
      // Si le champ actuel a une valeur, simplement l'effacer
      if (twoFADigits[index] !== '') {
        const newDigits = [...twoFADigits];
        newDigits[index] = '';
        setTwoFADigits(newDigits);
        // Garder le focus sur le champ actuel
      }
      // Si le champ actuel est vide et qu'on n'est pas sur le premier champ, aller au champ précédent
      else if (index > 0) {
        const newDigits = [...twoFADigits];
        newDigits[index - 1] = ''; // Effacer le champ précédent
        setTwoFADigits(newDigits);
        digitsRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Déplacer le focus au champ précédent
      digitsRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Déplacer le focus au champ suivant
      digitsRefs.current[index + 1].focus();
    } else if (/^[0-9]$/.test(e.key)) {
      // Si on tape un nouveau chiffre sur un champ déjà rempli, remplacer la valeur et passer au suivant
      const newDigits = [...twoFADigits];
      newDigits[index] = e.key;
      setTwoFADigits(newDigits);

      // Passer au champ suivant si possible
      if (index < 5) {
        e.preventDefault(); // Empêcher la saisie par défaut
        digitsRefs.current[index + 1].focus();
      }
    }
  };

  const handleDigitPaste = (index, e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length > 0) {
      const newDigits = [...twoFADigits];

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit;
        }
      });

      setTwoFADigits(newDigits);

      const nextEmptyIndex = newDigits.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        digitsRefs.current[nextEmptyIndex].focus();
      } else if (digits.length > 0) {
        digitsRefs.current[Math.min(index + digits.length, 5)].focus();
      }
    }
  };

  const handle2FASubmit = async e => {
    e.preventDefault();

    if (countEchec2FACode >= 2) {
      if (captchaValue.trim() === '') {
        return toast.error('Veuillez entrer le code de vérification (CAPTCHA)');
      }
      if (!validateCaptcha(captchaValue)) {
        return toast.error('Le code de vérification (CAPTCHA) est incorrect');
      }
    }

    // Join twoFADigits array to get the complete code
    const fullCode = twoFADigits.join('');

    if (fullCode.length !== 6) {
      return toast.error('Veuillez entrer un code à 6 chiffres');
    }

    setLoading(true); // Début du chargement
    try {
      const { data } = await axios.post(
        'https://localhost:8443/api/auth/verify-2fa',
        { code: fullCode, tempToken, setup: true },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.token) {
        setTwoFactorAuth(true);
        setTempToken(null);
        setTwoFADigits(['', '', '', '', '', '']);
        setCountEchec2FACode(0);
        setAuthStep('initial');
        toast.success('2FA activé avec succès.');
      } else {
        setCountEchec2FACode(prev => prev + 1);
        toast.error('Code 2FA invalide. Veuillez réessayer.');
      }
    } catch (error) {
      setCountEchec2FACode(prev => prev + 1);
      console.error('Erreur lors de la vérification 2FA:', error);
      toast.error('Code 2FA invalide. Veuillez réessayer.');
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  const handle2FASetup = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'https://localhost:8443/api/auth/activate-2fa',
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setQrCodeData(data.twoFASetup.qrCode);
      setManualSecret(data.twoFASetup.manualSecret);
      setTempToken(data.tempToken);
      setAuthStep('2fa-setup');
    } catch (error) {
      setCountEchec2FACode(prev => prev + 1);
      console.error('Erreur lors de la vérification 2FA:', error);
      toast.error(
        "Impossible d'activer l'authentification 2FA.\n Veuillez réessayer plus tard."
      );
    }
  };

  const handle2FAReset = async e => {
    e.preventDefault();
    try {
      await disable2FA();
      await handle2FASetup(e);
    } catch (error) {
      console.error('Erreur lors du reset 2FA:', error);
      toast.error('Une erreur est survenue lors du reset 2FA.');
    }
  };

  const handleSavePassword = async () => {
    const currentPassword = document.querySelector(
      'input[placeholder="Entrez votre mot de passe actuel"]'
    ).value;
    const newPassword = document.querySelector(
      'input[placeholder="Entrez un nouveau mot de passe"]'
    ).value;
    const confirmPassword = document.querySelector(
      'input[placeholder="Confirmez le nouveau mot de passe"]'
    ).value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Veuillez remplir tous les champs.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Les nouveaux mots de passe ne correspondent pas.');
    }

    if (newPassword === currentPassword) {
      return toast.error(
        'Mot de passe identique au mot de passe actuel.\n Veuillez choisir un autre mot de passe.'
      );
    }

    if (newPassword.length < 12) {
      return toast.error(
        'Le nouveau mot de passe doit contenir au moins 12 caractères.'
      );
    }

    const passwordSafety = zxcvbn(newPassword);
    if (passwordSafety.score < 3) {
      return toast.error(
        `Le nouveau mot de passe n'est pas sécurisé. Il doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.`
      );
    }

    setLoading(true); // Début du chargement
    setErrors({}); // Clear previous errors

    try {
      const userId = jwtDecode(authToken).id;

      await axios.put(
        `${API_URL}/users/${userId}`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast.success('Mot de passe mis à jour avec succès.');
      setHasUnsavedChanges(false);
    } catch (error) {
      if (error.response) {
        console.error('Erreur serveur:', error.response.data);
        setErrors({
          server:
            error.response.data.message || 'Une erreur serveur est survenue.',
        });
        toast.error(
          error.response.data.message || 'Une erreur serveur est survenue.'
        );
      } else if (error.request) {
        console.error('Erreur réseau:', error.request);
        setErrors({
          network:
            'Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.',
        });
        toast.error(
          'Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.'
        );
      } else {
        console.error('Erreur inconnue:', error.message);
        setErrors({
          unknown: 'Une erreur inconnue est survenue. Veuillez réessayer.',
        });
        toast.error('Une erreur inconnue est survenue. Veuillez réessayer.');
      }
      toast.error(
        'Une erreur est survenue. Veuillez vérifier les messages d’erreur.'
      );
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  const disable2FA = async () => {
    try {
      const response = await axios.delete(`${API_URL}/users/2fa`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200) {
        setTwoFactorAuth(!twoFactorAuth);
        toast.success("l'authentification 2FA a été desactivé avec succès.");
      }
    } catch (error) {
      if (error.response) {
        console.error('Erreur serveur:', error.response.data);
        setErrors({
          server:
            error.response.data.message || 'Une erreur serveur est survenue.',
        });
        toast.error(
          error.response.data.message || 'Une erreur serveur est survenue.'
        );
      } else if (error.request) {
        console.error('Erreur réseau:', error.request);
        setErrors({
          network:
            'Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.',
        });
        toast.error(
          'Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.'
        );
      } else {
        console.error('Erreur inconnue:', error.message);
        setErrors({
          unknown: 'Une erreur inconnue est survenue. Veuillez réessayer.',
        });
        toast.error('Une erreur inconnue est survenue. Veuillez réessayer.');
      }
      toast.error(
        'Une erreur est survenue. Veuillez vérifier les messages d’erreur.'
      );
    }
  };

  const TwoFASetupModal = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-out z-10">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="text-center space-y-7 mb-4">
          <h3 className="text-xl font-semibold">Configuration 2FA</h3>
          <img
            src={qrCodeData}
            alt="QR Code 2FA"
            className="mx-auto w-48 h-48 rounded-3xl shadow-lg mb-4 bg-white p-1 border-2 border-gray-200"
          />
          <p className="text-sm text-gray-600">
            Scannez le QR Code avec votre application d&apos;authentification ou
            entrez ce code manuellement :
          </p>
          <div className="font-mono bg-gray-100 p-2 rounded-lg">
            {manualSecret}
          </div>
        </div>

        <form onSubmit={handle2FASubmit} className="space-y-4">
          {countEchec2FACode >= 2 && (
            <>
              <LoadCanvasTemplate reloadColor="red" />
              <input
                type="text"
                placeholder="Entrez le texte CAPTCHA"
                value={captchaValue}
                onChange={e => setCaptchaValue(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </>
          )}
          <div className="flex space-x-2 items-center justify-center">
            {twoFADigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleDigitKeyDown(index, e)}
                onPaste={e => handleDigitPaste(index, e)}
                ref={el => (digitsRefs.current[index] = el)}
                maxLength="1"
                className="w-12 h-12 text-center border rounded-lg"
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={() => setAuthStep('2fa')}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Vérifier le code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  const renderSecurityTab = () => {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Lock className="h-6 w-6" />
            <span>Authentification</span>
          </h2>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Authentification à deux facteurs</h3>
              <p className="text-sm text-gray-500">
                Ajoutez une couche de sécurité supplémentaire
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Switch
                checked={twoFactorAuth}
                onChange={disable2FA}
                className={`${
                  twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                disabled={!twoFactorAuth}
              >
                <span
                  className={`${
                    twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>

              {!twoFactorAuth ? (
                <button
                  onClick={e => handle2FASetup(e)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Configurer
                </button>
              ) : (
                <button
                  onClick={e => handle2FAReset(e)}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Lock className="h-6 w-6" />
              <span>Modifier le mot de passe</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  placeholder="Entrez votre mot de passe actuel"
                  className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Entrez un nouveau mot de passe"
                  className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Confirmez le nouveau mot de passe"
                  className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                />
              </div>
              <button
                onClick={handleSavePassword}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Enregistrer le nouveau mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

            <div className="flex items-center">
              <div className="relative ml-5 mr-15">
                <div className="text-center mb-4">
                  <button
                    className="absolute top-15 -right-0 cursor-pointer border border-blue-400 p-1 rounded-full bg-black text-white"
                    onClick={() => setShowProfilepictureModal(true)}
                  >
                    <CogIcon className="h-4 w-4" />
                  </button>

                  {/* User avatar or placeholder */}
                  {loadingAvatar ? (
                    <div className="h-20 w-20 rounded-full border-2 bg-gray-200 mx-auto flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  ) : !userAvatar ? (
                    <div className="h-20 w-20 rounded-full border-2 bg-yellow-500 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {user.name ? user.name.charAt(0).toUpperCase() : ''}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover"
                      onError={() => refreshAvatar()} // En cas d'erreur, demandez au parent de rafraîchir
                    />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                Cliquez sur l’icône pour modifier votre photo de profil.
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
                  id="first-name"
                  type="text"
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleInputChange}
                  value={user.name || ''}
                />
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom
                </label>
                <input
                  id="last-name"
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
        return renderSecurityTab();

      case 'privacy':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span>Visibilité</span>
              </h2>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Profil public</h3>
                    <p className="text-sm text-gray-500">
                      Rendre mon profil visible par tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full"
                  >
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white" />
                  </Switch>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <BellIcon className="h-6 w-6" />
                <span>Données et confidentialité</span>
              </h2>

              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Partage de données</h3>
                  <div className="space-y-3">
                    <Checkbox
                      label="Autoriser les statistiques d'utilisation"
                      checked={dataSharing.analytics}
                      onChange={e => {
                        setDataSharing({
                          ...dataSharing,
                          analytics: e.target.checked,
                        });
                        handleInputChange();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
      {authStep === '2fa-setup' && TwoFASetupModal()}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                      // Ajouter logique de suppression ici
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
              onClick={updateUserProfile}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

Settings.propTypes = {
  authToken: PropTypes.string.isRequired,
  refreshAvatar: PropTypes.func.isRequired,
  userAvatar: PropTypes.string, // Peut être null
  loadingAvatar: PropTypes.bool.isRequired
};
export default Settings;
