import {
  Eye,
  EyeOff,
} from 'lucide-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LoadCanvasTemplate, loadCaptchaEnginge as loadCaptchaEngine, validateCaptcha } from 'react-simple-captcha';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../../Logo';
import SubmitButton from '../../components/SubmitButton';
import PropTypes from 'prop-types';

const errorMessages = {
  'auth/invalid-credentials': 'Identifiants incorrects',
  'auth/invalid-register-code': "Code d'inscription invalide/expiré",
  'auth/email-exists': 'Cet email est déjà utilisé',
  'auth/user-not-found': 'Utilisateur introuvable',
  'auth/username-exists': "Ce nom d'utilisateur est déjà utilisé",
  'auth/2fa-required': 'Vérification 2FA requise',
  'auth/invalid-2fa-code': 'Code de double authentification incorrect',
  'auth/weak-password':
    'Le mot de passe doit contenir au moins 12 caractères, une majuscule et un caractère spécial',
  default: 'Une erreur est survenue. Veuillez réessayer.',
};

const Sign = ({ setAuth, unsetLoggedOut }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSignUpForm, setIsSignUpForm] = useState(false);
  const [authStep, setAuthStep] = useState('initial');
  const [tempToken, setTempToken] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [countEchec2FACode, setCountEchec2FACode] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [qrCodeData, setQrCodeData] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [lastSubmit, setLastSubmit] = useState(0);
  const [code, setCode] = useState('');

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
        const { data } = await axios.post(
          'https://localhost:8443/api/auth/refresh-2fa-setup',
          {
            tempToken: tempToken?.value,
            twoFASetup: { qrCode: qrCodeData, manualSecret },
          }
        );
        const decodedToken = jwtDecode(data.tempToken);
        setTempToken({
          value: data.tempToken,
          expiresAt: decodedToken.exp * 1000,
        });
        setQrCodeData(data.twoFASetup.qrCode);
        setManualSecret(data.twoFASetup.manualSecret);
        setError(null);
      } catch (error) {
        setError(error.response.data.message || errorMessages.default);
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
    return /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{12,})/.test(pw);
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
    // Décommentez la ligne suivante pour activer la validation CAPTCHA
    if (captchaValue.trim() === '') {
      return setError('Veuillez entrer le code de vérification (CAPTCHA)');
    }

    if (captchaValue !== '' && !validateCaptcha(captchaValue)) {
      return setError('Le code de vérification (CAPTCHA) est incorrect');
    }

    try {
      const endpoint = isSignUpForm
        ? 'https://localhost:8443/api/auth/register'
        : 'https://localhost:8443/api/auth/login';

      const body = isSignUpForm
        ? { email, username, password, name, surname, registerCode: code }
        : { email, password };

      if (isSignUpForm) {
        let validRegisterCode = false;
        try {
          const res = await axios.post(
            'https://localhost:8443/api/auth/check-register-code',
            { code }
          );

          if (res.data.error) {
            throw new Error(res.data.error);
          }

          validRegisterCode = res.data.isValid;
        } catch (error) {
          return setError(error.message);
        }

        if (validRegisterCode) {
          const { data } = await axios.post(endpoint, body);

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
            return true; // Important pour le SubmitButton
          }
        }
      } else {
        const { data } = await axios.post(endpoint, body);
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
          return true; // Important pour le SubmitButton
        }
      }
      return true;
    } catch (error) {
      const errorCode = error.response?.data?.message || 'default';
      setError(errorMessages[errorCode] || errorMessages.default);
      return false;
    }
  };

  const handle2FASubmit = async e => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setError(null);

    if (countEchec2FACode >= 2) {
      // Validation CAPTCHA
      // Décommentez la ligne suivante pour activer la validation CAPTCHA
      if (captchaValue.trim() === '') {
        return setError('Veuillez entrer le code de vérification (CAPTCHA)');
      }
      if (captchaValue !== '' && !validateCaptcha(captchaValue)) {
        return setError('Le code de vérification (CAPTCHA) est incorrect');
      }
    }

    if (!twoFACode.trim()) {
      return setError('Veuillez entrer le code de vérification 2FA');
    }

    try {
      const endpoint =
        authStep === '2fa-verification'
          ? 'https://localhost:8443/api/auth/verify-2fa'
          : 'https://localhost:8443/api/auth/activate-2fa';

      const { data } = await axios.post(endpoint, {
        tempToken: tempToken?.value,
        code: twoFACode,
        setup: authStep === '2fa-setup',
      });

      if (data.token) {
        handleAuthSuccess(data.token);
        return true; // Important pour le SubmitButton
      }
      return true;
    } catch (error) {
      setCountEchec2FACode(prev => prev + 1);
      const errorCode = error.response?.data?.message || 'default';
      setError(errorMessages[errorCode] || errorMessages.default);
      return false;
    }
  };

  const handleAuthSuccess = token => {
    setAuth(token);
    unsetLoggedOut(false);
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
    navigate('/dashboard');
  };

  const toggleAuthMode = () => {
    setIsSignUpForm(!isSignUpForm);
    setError(null);
    if (isSignUpForm) {
      setUsername('');
      setName('');
      setConfirmPassword('');
    }
  };

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

      <div className="relative">
        <input
          id="2faCode"
          type="text"
          placeholder="Code à 6 chiffres"
          value={twoFACode}
          onChange={e =>
            setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
          required
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength="6"
          autoFocus
        />
      </div>

      <SubmitButton
        onSubmission={handle2FASubmit}
        className="w-full py-4 text-lg md:text-xl font-semibold text-white bg-[#002B2F] rounded-lg hover:bg-[#00474F]"
      />

      {authStep !== '2fa-setup' && (
        <p className="text-center text-base md:text-lg">
          <button
            type="button"
            onClick={() => {
              setAuthStep('initial');
              setTempToken(null);
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
    </form>
  );

  return (
    <section className="flex w-screen h-screen">
      <div className="m-auto w-full max-w-2xl px-4">
        <section className="border-2 bg-gray-50 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-[#002B2F] text-center">
            <a href="/" className="flex justify-center">
              <Logo className="w-24 h-24 md:w-32 md:h-32" fillColor="#002B2F" />
            </a>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-center my-8">
            {authStep === '2fa-verification' && 'Vérification 2FA'}
            {authStep === '2fa-setup' && 'Activation 2FA'}
            {authStep === 'initial' &&
              (isSignUpForm ? 'Inscription' : 'Connexion')}
          </h1>

          {error && (
            <div className="text-red-600 text-lg text-center mb-4" role="alert">
              {error}
            </div>
          )}

          {authStep.startsWith('2fa')
            ? render2FAContent()
            : renderInitialForm()}
        </section>
      </div>
    </section>
  );
};

Sign.propTypes = {
  unsetLoggedOut: PropTypes.func,
  setAuth: PropTypes.func,
};
export default Sign;
