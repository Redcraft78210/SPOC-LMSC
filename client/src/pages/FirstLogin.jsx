import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import axios from 'axios';

const errorMessages = {
  'auth/invalid-credentials': 'Identifiants incorrects',
  'auth/missing-fields': 'Veuillez remplir tous les champs',
  'auth/invalid-register-code': "Code d'inscription invalide/expiré",
  'auth/email-exists': 'Cet email est déjà utilisé',
  'auth/user-not-found': 'Utilisateur introuvable',
  'auth/username-exists': "Ce nom d'utilisateur est déjà utilisé",
  'auth/2fa-required': 'Vérification 2FA requise',
  'auth/session-expired': 'Session expirée',
  'auth/invalid-2fa-code': 'Code de double authentification incorrect',
  'auth/weak-password':
    'Le mot de passe doit contenir au moins 12 caractères, une majuscule et un caractère spécial',
  default: 'Une erreur est survenue. Veuillez réessayer.',
};

const API_URL = 'https://localhost:8443/api';

const FirstLogin = ({ token, setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const storedis2FASetup = localStorage.getItem('is2FASetup');
  const storedTempToken = localStorage.getItem('tempToken');
  const storedQrCodeData = localStorage.getItem('QrCodeData');
  const storedManualSecret = localStorage.getItem('manualSecret');

  const [is2FASetup, setIs2FASetup] = useState(
    storedis2FASetup ? storedis2FASetup : null
  );
  const [tempToken, setTempToken] = useState(
    storedTempToken ? storedTempToken : null
  );

  const [qrCodeData, setQrCodeData] = useState(
    storedQrCodeData ? storedQrCodeData : ''
  );

  const [manualSecret, setManualSecret] = useState(
    storedManualSecret ? storedManualSecret : ''
  );

  const [twoFACode, setTwoFACode] = useState('');
  const [is2FARefreshing, setIs2FARefreshing] = useState(false);
  const navigate = useNavigate();

  const validatePassword = pw => {
    return /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{12,})/.test(pw);
  };

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const refresh2FASetup = async () => {
      setIs2FARefreshing(true);
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-2fa-setup`, {
          tempToken: tempToken,
        });
        setTempToken(data.tempToken);
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || errorMessages.default);
        setIs2FASetup(false);
        setTempToken(null);
        localStorage.removeItem('is2FASetup'); // Remove 2FA setup state
        localStorage.removeItem('tempToken'); // Remove temp token
        localStorage.removeItem('QrCodeData'); // Remove QR code data
        localStorage.removeItem('manualSecret'); // Remove manual secret
      } finally {
        setIs2FARefreshing(false);
      }
    };

    if (tempToken) {
      try {
        const decodedToken = jwtDecode(tempToken);
        const expirationTime = decodedToken.exp * 1000;

        if (expirationTime > Date.now()) {
          const timeUntilRefresh = Math.max(
            1000,
            (expirationTime - Date.now()) / 2
          );
          timeoutId = setTimeout(refresh2FASetup, timeUntilRefresh);
          intervalId = setInterval(refresh2FASetup, timeUntilRefresh);
        }
      } catch (error) {
        console.error('Erreur de décodage JWT:', error);
        setError('Token invalide. Veuillez réessayer.');
        setIs2FASetup(false);
        setTempToken(null);
        localStorage.removeItem('is2FASetup'); // Remove 2FA setup state
        localStorage.removeItem('tempToken'); // Remove temp token
        localStorage.removeItem('QrCodeData'); // Remove QR code data
        localStorage.removeItem('manualSecret'); // Remove manual secret
      }
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [setTempToken, manualSecret, qrCodeData, tempToken]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!username || !password || !confirmPassword) {
      return setError(errorMessages['auth/missing-fields']);
    }

    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }

    if (!validatePassword(password)) {
      return setError(errorMessages['auth/weak-password']);
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        'https://localhost:8443/api/auth/first-login',
        { username, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem('token', data.tempToken);
      localStorage.setItem('QrCodeData', data.twoFASetup.qrCode);
      localStorage.setItem('manualSecret', data.twoFASetup.manualSecret);
      localStorage.setItem('tempToken', data.tempToken);
      localStorage.setItem('is2FASetup', true);

      setQrCodeData(data.twoFASetup.qrCode);
      setManualSecret(data.twoFASetup.manualSecret);
      setTempToken(data.tempToken);
      setIs2FASetup(true);
    } catch (err) {
      const errorCode = err.response?.data?.message || 'default';
      if (errorCode === 'auth/invalid-credentials') {
        navigate('/logout');
        localStorage.removeItem('token'); // Remove token on logout
      }
      setError(errorMessages[errorCode] || errorMessages.default);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!twoFACode.trim()) {
      return setError(errorMessages['auth/missing-fields']);
    }

    try {
      const { data } = await axios.post(
        'https://localhost:8443/api/auth/verify-2fa',
        { code: twoFACode, tempToken, setup: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      localStorage.removeItem('is2FASetup'); // Remove 2FA setup state
      localStorage.removeItem('tempToken'); // Remove temp token
      localStorage.removeItem('QrCodeData'); // Remove QR code data
      localStorage.removeItem('manualSecret'); // Remove manual secret
      
      setAuth(data.token);
      navigate('/dashboard');
    } catch (err) {
      const errorCode = err.response?.data?.message || 'default';
      if (errorCode === 'auth/session-expired') {
        setIs2FASetup(false);
        localStorage.removeItem('is2FASetup'); // Remove 2FA setup state
        localStorage.removeItem('tempToken'); // Remove temp token
        localStorage.removeItem('QrCodeData'); // Remove QR code data
        localStorage.removeItem('manualSecret'); // Remove manual secret
      }
      setError(errorMessages[errorCode] || errorMessages.default);
    }
  };

  if (is2FARefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Mise à jour de la configuration 2FA...
          </p>
        </div>
      </div>
    );
  }

  if (is2FASetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Configuration 2FA
          </h1>
          <p className="text-gray-600 mb-4 text-center">
            Scannez le QR Code avec votre application d&apos;authentification ou
            entrez ce code manuellement :
          </p>
          <div className="text-center mb-4">
            {/* Ensure the Base64 string is used correctly */}
            <img
              src={qrCodeData} // Base64 string for the QR code
              alt="QR Code 2FA"
              className="mx-auto w-48 h-48 rounded-lg shadow-md"
            />
            <p className="mt-2 font-mono bg-gray-100 p-2 rounded-lg">
              {manualSecret}
            </p>
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div>
              <label
                htmlFor="twoFACode"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Code de vérification 2FA
              </label>
              <input
                id="twoFACode"
                type="text"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le code 2FA"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Vérifier'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Première Connexion
        </h1>
        <p className="text-gray-600 mb-4 text-center">
          Veuillez définir un nouveau mot de passe pour sécuriser votre compte.
        </p>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez un nouveau mot de passe"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirmez le mot de passe"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
};

FirstLogin.propTypes = {
  token: PropTypes.string.isRequired,
  setAuth: PropTypes.func.isRequired,
};

export default FirstLogin;
