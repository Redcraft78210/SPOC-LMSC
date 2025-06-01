import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import { verifyTwoFA, refreshTwoFASetup, firstLogin, check2FAStatus } from '../API/AuthCaller';

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
  'auth/invalid-token': 'Session expirée',
  default: 'Une erreur est survenue. Veuillez réessayer.',
};

const FirstLogin = ({ token, setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAAlreadySetup, setIs2FAAlreadySetup] = useState(false);

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

  const [twoFADigits, setTwoFADigits] = useState(['', '', '', '', '', '']);
  const digitsRefs = useRef([]);
  const [is2FARefreshing, setIs2FARefreshing] = useState(false);
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem('authToken')
  );

  const validatePassword = pw => {
    return /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{12,})/.test(pw);
  };

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const refresh2FASetup = async () => {
      setIs2FARefreshing(true);
      try {
        const response = await refreshTwoFASetup({
          tempToken: tempToken,
          twoFASetup: {} // Add any required setup data
        });

        if (response.status === 201) {
          setTempToken(response.data.tempToken);
          setError(null);
        } else {
          throw { response: { data: { message: response.message } } };
        }
      } catch (error) {
        setError(error.response?.data?.message || errorMessages.default);
        if (error.response?.data?.message === 'auth/invalid-token') {
          setIs2FASetup(false);
          setTempToken(null);
          localStorage.removeItem('is2FASetup');
          localStorage.removeItem('tempToken');
          localStorage.removeItem('QrCodeData');
          localStorage.removeItem('manualSecret');
        }
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
        localStorage.removeItem('is2FASetup');
        localStorage.removeItem('tempToken');
        localStorage.removeItem('QrCodeData');
        localStorage.removeItem('manualSecret');
      }
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [setTempToken, manualSecret, qrCodeData, tempToken]);

  useEffect(() => {
    // Check if 2FA is already configured for the user
    const check2FAStatusForUser = async () => {
      try {
        const response = await check2FAStatus({ token });
        if (response.status === 200) {
          setIs2FAAlreadySetup(response.data.is2FAEnabled);
        } else {
          console.error('Error checking 2FA status:', response.message);
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      }
    };

    check2FAStatusForUser();
  }, [token]);

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
      const response = await firstLogin({ username, password, token });

      if (response.status === 200) {
        // Si 2FA déjà configuré, stocke le token selon rememberMe
        if (is2FAAlreadySetup) {
          if (rememberMe) {
            localStorage.setItem('authToken', response.data.token);
            sessionStorage.removeItem('authToken');
          } else {
            sessionStorage.setItem('authToken', response.data.token);
            localStorage.removeItem('authToken');
          }
          
          // Clean up all temporary tokens
          localStorage.removeItem('token');
          localStorage.removeItem('tempToken');
          localStorage.removeItem('QrCodeData');
          localStorage.removeItem('manualSecret');
          localStorage.removeItem('is2FASetup');
          
          setAuth(response.data.token);
          navigate('/dashboard');
          return;
        }

        localStorage.setItem('token', response.data.tempToken);
        localStorage.setItem('QrCodeData', response.data.twoFASetup.qrCode);
        localStorage.setItem('manualSecret', response.data.twoFASetup.manualSecret);
        localStorage.setItem('tempToken', response.data.tempToken);
        localStorage.setItem('is2FASetup', true);

        setQrCodeData(response.data.twoFASetup.qrCode);
        setManualSecret(response.data.twoFASetup.manualSecret);
        setTempToken(response.data.tempToken);
        setIs2FASetup(true);
      } else {
        throw { response: { data: { message: response.message } } };
      }
    } catch (err) {
      const errorCode = err.response?.data?.message || 'default';
      if (errorCode === 'auth/invalid-credentials') {
        navigate('/logout');
        localStorage.removeItem('token');
      }
      if (errorCode === 'auth/invalid-token') {
        setTempToken(null);
        localStorage.removeItem('is2FASetup');
        localStorage.removeItem('tempToken');
        localStorage.removeItem('QrCodeData');
        localStorage.removeItem('manualSecret');
        localStorage.removeItem('token');
        navigate('/logout');
      }
      setError(errorMessages[errorCode] || errorMessages.default);
    } finally {
      setIsLoading(false);
    }
  };

  const allDigitsFilled = () => twoFADigits.every(digit => digit !== '');

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
    setError(null);

    const fullCode = twoFADigits.join('');

    if (fullCode.length !== 6) {
      return setError('Veuillez entrer un code à 6 chiffres');
    }

    try {
      const response = await verifyTwoFA({
        code: fullCode,
        tempToken,
        setup: true
      });

      if (response.status === 200) {
        localStorage.removeItem('is2FASetup');
        localStorage.removeItem('tempToken');
        localStorage.removeItem('QrCodeData');
        localStorage.removeItem('manualSecret');
        localStorage.removeItem('token');

        setAuth(response.data.token);
        navigate('/dashboard');
      } else {
        throw { response: { data: { message: response.message } } };
      }
    } catch (err) {
      const errorCode = err.response?.data?.message || 'default';
      if (errorCode === 'auth/session-expired') {
        setIs2FASetup(false);
        localStorage.removeItem('is2FASetup');
        localStorage.removeItem('tempToken');
        localStorage.removeItem('QrCodeData');
        localStorage.removeItem('manualSecret');
        localStorage.removeItem('token');
        navigate('/logout');
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

  if (is2FASetup && !is2FAAlreadySetup) {
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
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Code de vérification 2FA
              </label>
              <div className="flex gap-2 justify-center mb-4">
                {twoFADigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (digitsRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={e => handleDigitChange(index, e.target.value)}
                    onKeyDown={e => handleDigitKeyDown(index, e)}
                    onPaste={e => handleDigitPaste(index, e)}
                    className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-bold"
                    aria-label={`Digit ${index + 1} of verification code`}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={isLoading || !allDigitsFilled()}
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
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700">
              Se souvenir de moi
            </label>
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
