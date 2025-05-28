import { Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import {
  LoadCanvasTemplate,
  loadCaptchaEnginge as loadCaptchaEngine,
  validateCaptcha,
} from 'react-simple-captcha';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Logo from '../../Logo';
import SubmitButton from '../../components/SubmitButton';
import PropTypes from 'prop-types';

// Importer les fonctions du AuthCaller
import {
  login,
  register,
  checkRegisterCode,
  verifyTwoFA,
  refreshTwoFASetup,
  forgotPassword
} from '../../API/AuthCaller';

const errorMessages = {
  'auth/invalid-credentials': 'Identifiants incorrects',
  'auth/invalid-register-code': "Code d'inscription invalide/expiré",
  'auth/email-exists': 'Cet email est déjà utilisé',
  'auth/user-not-found': 'Utilisateur introuvable',
  'auth/username-exists': "Ce nom d'utilisateur est déjà utilisé",
  'auth/2fa-required': 'Vérification 2FA requise',
  'auth/invalid-2fa-code': 'Code de double authentification incorrect',
  'auth/weak-password':
    'Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
  default: 'Une erreur est survenue. Veuillez réessayer.',
};

const AccountDisabledModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
   <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <TriangleAlert 
              className="h-8 w-8 text-red-600" 
              aria-hidden="true"
            />
          </div>
          
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Compte désactivé
          </h3>
          
          <p className="mt-4 text-gray-600">
            Votre compte a été désactivé. Pour contester cette décision ou obtenir 
            des informations supplémentaires, veuillez contacter l&apos;équipe de modération 
            via notre formulaire de contact.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Accéder au formulaire
            </a>
            
            <button
              onClick={onClose}
              type="button"
              className="inline-flex justify-center items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


AccountDisabledModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const Sign = ({ setAuth }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSignUpForm, setIsSignUpForm] = useState(false);
  const [authStep, setAuthStep] = useState('initial');
  const [tempToken, setTempToken] = useState(null);
  // Replace single string state with array of 6 digits
  const [twoFADigits, setTwoFADigits] = useState(['', '', '', '', '', '']);
  const digitsRefs = useRef([]);
  const [countEchec2FACode, setCountEchec2FACode] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [lastSubmit, setLastSubmit] = useState(0);
  const [code, setCode] = useState('');
  const [showAccountDisabledModal, setShowAccountDisabledModal] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsSignUpForm(searchParams.get('reister'));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadCaptchaEngine(6, '#f9fafb');
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (countEchec2FACode === 2 || authStep === 'initial') {
      const timeout = setTimeout(() => {
        loadCaptchaEngine(6, '#f9fafb');
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [countEchec2FACode, authStep]);

  useEffect(() => {
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    setLastSubmit(0);
  }, [authStep]);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const refresh2FASetup = async () => {
      try {
        // Utiliser le AuthCaller au lieu d'axios
        const response = await refreshTwoFASetup({
          tempToken: tempToken?.value,
          twoFASetup: { qrCode: qrCodeData, manualSecret }
        });

        if (response.status !== 200) {
          throw new Error(response.message || errorMessages.default);
        }

        const decodedToken = jwtDecode(response.data.tempToken);
        setTempToken({
          value: response.data.tempToken,
          expiresAt: decodedToken.exp * 1000,
        });
        setQrCodeData(response.data.twoFASetup.qrCode);
        setManualSecret(response.data.twoFASetup.manualSecret);
        setError(null);
      } catch (error) {
        setError(error.data.message || errorMessages.default);
        setAuthStep('initial');
        setTempToken(null);
      }
    };

    if (tempToken?.value) {
      try {
        const decodedToken = jwtDecode(tempToken.value);
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
        setAuthStep('initial');
        setTempToken(null);
      }
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [tempToken?.value, qrCodeData, manualSecret]);

  const validatePassword = pw => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{12,}$/.test(pw);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setError(null);

    if (!email.trim() || !password.trim()) {
      return setError('Veuillez remplir tous les champs requis');
    }

    if (isSignUpForm) {
      if (password !== confirmPassword) {
        return setError('Les mots de passe ne correspondent pas');
      }
      if (code.trim() === '') {
        return setError("Veuillez entrer le code d'inscription");
      }
      if (!validatePassword(password)) {

        return setError(errorMessages['auth/weak-password']);
      }
    }

    // Validation CAPTCHA
    if (captchaValue.trim() === '') {
      return setError('Veuillez entrer le code de vérification (CAPTCHA)');
    }

    if (captchaValue !== '' && !validateCaptcha(captchaValue)) {
      return setError('Le code de vérification (CAPTCHA) est incorrect');
    }

    try {
      if (isSignUpForm) {
        // Vérifier le code d'inscription
        const codeCheckResponse = await checkRegisterCode({ code });

        if (!codeCheckResponse.data.isValid) {
          throw new Error(codeCheckResponse.message || errorMessages['auth/invalid-register-code']);
        }

        // Enregistrer l'utilisateur
        const registerResponse = await register({
          email: email.trim(),
          username: username.trim(),
          password: password.trim(),
          name: name.trim(),
          surname: surname.trim(),
          registerCode: code.trim(),
        });

        if (registerResponse.status !== 200 && registerResponse.status !== 201) {
          throw new Error(registerResponse.message || errorMessages.default);
        }

        const data = registerResponse.data;

        if (data.requires2FA || data.twoFASetup) {
          setAuthStep(data.twoFASetup ? '2fa-setup' : '2fa-verification');
          const decodedToken = jwtDecode(data.tempToken);
          setTempToken({
            value: data.tempToken,
            expiresAt: decodedToken.exp * 1000,
          });
          if (data.twoFASetup) {
            setQrCodeData(data.twoFASetup.qrCode);
            setManualSecret(data.twoFASetup.manualSecret);
          }
        } else if (data.token) {
          handleAuthSuccess(data.token);
        }
      } else {
        // Connexion
        const loginResponse = await login({
          email: email.trim(),
          password: password.trim(),
        });

        if (loginResponse.status === 403) {
          setShowAccountDisabledModal(true);
          return false;
        }

        if (loginResponse.status !== 200) {
          throw new Error(loginResponse.message || errorMessages.default);
        }

        const data = loginResponse.data;

        if (data.requires2FA || data.twoFASetup) {
          setAuthStep(data.twoFASetup ? '2fa-setup' : '2fa-verification');
          const decodedToken = jwtDecode(data.tempToken);
          setTempToken({
            value: data.tempToken,
            expiresAt: decodedToken.exp * 1000,
          });
          if (data.twoFASetup) {
            setQrCodeData(data.twoFASetup.qrCode);
            setManualSecret(data.twoFASetup.manualSecret);
          }
        } else if (data.token) {
          handleAuthSuccess(data.token);
        }
      }
      return true;
    } catch (error) {
      // Gestion de l’erreur 403 côté catch (au cas où)
      if (error?.response?.status === 403 || error?.status === 403) {
        setShowAccountDisabledModal(true);
        return false;
      }
      const errorMessage = error.data?.message || error.message || errorMessages.default;
      setError(errorMessage);
      return false;
    }
  };

  // Helper to check if all digits are filled
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

  // Update the 2FA submit handler to use joined digits
  const handle2FASubmit = async e => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setError(null);

    // Get the full 2FA code by joining the digits
    const fullCode = twoFADigits.join('');

    if (countEchec2FACode >= 2) {
      // Validation CAPTCHA
      if (captchaValue.trim() === '') {
        return setError('Veuillez entrer le code de vérification (CAPTCHA)');
      }
      if (captchaValue !== '' && !validateCaptcha(captchaValue)) {
        return setError('Le code de vérification (CAPTCHA) est incorrect');
      }
    }

    if (fullCode.length !== 6) {
      return setError('Veuillez entrer un code à 6 chiffres');
    }

    try {
      // Utiliser le AuthCaller au lieu d'axios
      const response = await verifyTwoFA({
        tempToken: tempToken?.value,
        code: fullCode,
        setup: authStep === '2fa-setup',
      });

      if (response.status === 403) {
        setShowAccountDisabledModal(true);
        return false;
      }

      if (response.status !== 200) {
        throw new Error(response.message || errorMessages.default);
      }

      if (response.data.token) {
        handleAuthSuccess(response.data.token);
        return true;
      }
      return true;
    } catch (error) {
      if (error?.response?.status === 403 || error?.status === 403) {
        setShowAccountDisabledModal(true);
        return false;
      }
      setCountEchec2FACode(prev => prev + 1);
      const errorMessage = error.data?.message || error.message || errorMessages.default;
      setError(errorMessage);
      return false;
    }
  };

  const handleAuthSuccess = token => {
    setAuth(token);
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken'); // Nettoie sessionStorage si besoin
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken'); // Nettoie localStorage si besoin
    }
    navigate('/dashboard');
  };

  const handleForgotPasswordSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      return setError('Veuillez entrer votre email');
    }

    try {
      // Utiliser le AuthCaller au lieu d'axios
      const response = await forgotPassword({ email: email.trim() });

      if (response.status !== 200) {
        throw new Error(response.message || errorMessages.default);
      }

      setError(response.message);
      setAuthStep('initial');
    } catch (error) {
      const errorMessage = error.data.message || errorMessages.default;
      setError(errorMessage);
    }
  };

  // Le reste du composant reste inchangé
  const toggleAuthMode = () => {
    setIsSignUpForm(!isSignUpForm);
    setError(null);
    if (isSignUpForm) {
      setUsername('');
      setName('');
      setConfirmPassword('');
    }
  };

  // Le reste du composant reste inchangé (render2FAContent, renderForgotPasswordForm, renderInitialForm)
  const render2FAContent = () => (
    <form onSubmit={handle2FASubmit} className="w-full space-y-8">
      {authStep === '2fa-setup' && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Configuration 2FA</h3>
          <img
            src={qrCodeData}
            alt="QR Code 2FA"
            className="mx-auto w-48 h-48 rounded-3xl shadow-lg mb-4 bg-white p-1 border-2 border-gray-200"
            aria-describedby="qrCodeDesc"
          />
          <p id="qrCodeDesc" className="text-sm text-gray-600">
            Scannez le QR Code avec votre application d&apos;authentification ou
            entrez ce code manuellement :
          </p>
          <div className="font-mono bg-gray-100 p-2 rounded-lg">
            {manualSecret}
          </div>
        </div>
      )}

      {countEchec2FACode >= 2 && (
        <>
          <div className="captcha-container">
            <LoadCanvasTemplate reloadColor="red" />
          </div>
          <div className="relative">
            <input
              id="captcha"
              type="text"
              placeholder="Entrez le texte CAPTCHA"
              value={captchaValue}
              onChange={e => setCaptchaValue(e.target.value)}
              className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
              required
            />
          </div>
        </>
      )}

      {/* Replace single input with 6 digit inputs */}
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
              className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl font-bold bg-white focus:ring-2 focus:ring-[#002B2F]"
              aria-label={`Digit ${index + 1} of verification code`}
              autoFocus={index === 0}
            />
          ))}
        </div>
      </div>

      <SubmitButton
        onSubmission={handle2FASubmit}
        className="w-full py-4 text-lg md:text-xl font-semibold text-white bg-[#002B2F] rounded-lg hover:bg-[#00474F]"
        disabled={!allDigitsFilled()}
      />

      {authStep !== '2fa-setup' && (
        <p className="text-center text-base md:text-lg">
          <button
            type="button"
            onClick={() => {
              setAuthStep('initial');
              setTempToken(null);
              // Reset the 2FA digits when going back
              setTwoFADigits(['', '', '', '', '', '']);
              setTimeout(() => {
                loadCaptchaEngine(6, '#f9fafb');
              }, 100); // ensure canvas is mounted
            }}
            className="font-bold underline hover:text-[#00474F]"
          >
            Retour
          </button>
        </p>
      )}
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPasswordSubmit} className="w-full space-y-8">
      <div className="relative">
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
          required
          autoFocus
        />
      </div>

      <SubmitButton
        onSubmission={handleForgotPasswordSubmit}
        className="w-full py-4 text-lg md:text-xl font-semibold text-white bg-[#002B2F] rounded-lg hover:bg-[#00474F]"
      />

      <p className="text-center text-base md:text-lg">
        <button
          type="button"
          onClick={() => {
            setAuthStep('initial');
            setError(null);
          }}
          className="font-bold underline hover:text-[#00474F]"
        >
          Retour à la connexion
        </button>
      </p>
    </form>
  );

  const renderInitialForm = () => (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      {isSignUpForm && (
        <>
          <div className="relative">
            <input
              id="username"
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
              required
              minLength="3"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              id="name"
              type="text"
              placeholder="Prénom"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
              required
            />
            <input
              id="surname"
              type="text"
              placeholder="Nom"
              value={surname}
              onChange={e => setSurname(e.target.value)}
              className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
              required
            />
          </div>
        </>
      )}

      <div className="relative">
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
          required
          autoFocus
        />
      </div>

      {isSignUpForm && (
        // code d'inscription
        <div className="relative">
          <input
            id="code"
            type="text"
            placeholder="Code d'inscription"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
            required
          />
        </div>
      )}

      <div className="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg pr-12"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-4 text-[#002B2F]"
          aria-label={
            showPassword ? 'Cacher mot de passe' : 'Afficher mot de passe'
          }
        >
          {showPassword ? (
            <EyeOff className="w-6 h-6" />
          ) : (
            <Eye className="w-6 h-6" />
          )}
        </button>
      </div>

      {isSignUpForm && (
        <div className="relative">
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
            required
          />
        </div>
      )}

      <div className="captcha-container">
        <LoadCanvasTemplate />
      </div>

      <div className="relative">
        <input
          id="captcha"
          type="text"
          placeholder="Entrez le texte CAPTCHA"
          value={captchaValue}
          onChange={e => setCaptchaValue(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg"
          required
        />
      </div>

      <SubmitButton
        onSubmission={handleSubmit}
        className="w-full py-4 text-lg md:text-xl font-semibold text-white bg-[#002B2F] rounded-lg hover:bg-[#00474F]"
      />

      <div className="flex items-center space-x-3">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={e => setRememberMe(e.target.checked)}
          className="w-5 h-5 text-[#002B2F] rounded"
        />
        <label htmlFor="rememberMe" className="text-base md:text-lg">
          Se souvenir de moi
        </label>
      </div>

      <p className="text-center text-base md:text-lg">
        {isSignUpForm ? 'Déjà un compte ? ' : 'Pas de compte ? '}
        <button
          type="button"
          onClick={toggleAuthMode}
          className="font-bold underline hover:text-[#00474F]"
        >
          {isSignUpForm ? 'Connectez-vous ici' : 'Créez-en ici'}
        </button>
      </p>

      {!isSignUpForm && (
        <p className="text-center text-base md:text-lg">
          <button
            type="button"
            onClick={() => setAuthStep('forgot-password')}
            className="font-bold underline hover:text-[#00474F]"
          >
            Mot de passe oublié ?
          </button>
        </p>
      )}
    </form>
  );

  return (
    <section className="flex w-screen h-screen">
      <div className="m-auto w-full max-w-2xl px-4">
        <section className="border-2 bg-gray-50 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-[#002B2F] text-center">
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                navigate('/');
              }}
              className="flex justify-center"
            >
              <Logo className="w-24 h-24 md:w-32 md:h-32" fillColor="#002B2F" />
            </a>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-center my-8">
            {authStep === '2fa-verification' && 'Vérification 2FA'}
            {authStep === '2fa-setup' && 'Activation 2FA'}
            {authStep === 'forgot-password' && 'Mot de passe oublié'}
            {authStep === 'initial' &&
              (isSignUpForm ? 'Inscription' : 'Connexion')}
          </h1>

          {error && (
            <div className="text-red-600 text-lg text-center mb-4" role="alert">
              {error}
            </div>
          )}

          {authStep === 'forgot-password'
            ? renderForgotPasswordForm()
            : authStep.startsWith('2fa')
              ? render2FAContent()
              : renderInitialForm()}
        </section>
      </div>
      {/* MODALE COMPTE DÉSACTIVÉ */}
      <AccountDisabledModal
        open={showAccountDisabledModal}
        onClose={() => setShowAccountDisabledModal(false)}
      />
    </section>
  );
};

Sign.propTypes = {
  setAuth: PropTypes.func,
};

export default Sign;
