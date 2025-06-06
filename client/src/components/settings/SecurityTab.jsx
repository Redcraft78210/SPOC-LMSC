import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {



  validateCaptcha,
} from 'react-simple-captcha';

import { changePassword } from '../../API/UserCaller';

import { setup2FA, verify2FASetup, disable2FA } from '../../API/AuthCaller';

const LoadCanvasTemplate = lazy(() =>
  import('react-simple-captcha').then(module => ({ default: module.LoadCanvasTemplate }))
);

const loadCaptchaEngine = lazy(() =>
  import('react-simple-captcha').then(module => ({ default: module.loadCaptchaEnginge }))
);


const Spinner = () => (
  <Loader2 className="h-4 w-4 animate-spin" />
);


const TwoFASetupModal = lazy(() => {
  return new Promise(resolve => {

    setTimeout(() => {
      resolve({
        default: ({ qrCodeData, manualSecret, handle2FASubmit, countEchec2FACode,
          captchaValue, setCaptchaValue, twoFADigits, handleDigitChange,
          handleDigitKeyDown, handleDigitPaste, digitsRefs, setAuthStep, loading }) => (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-out z-10">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-in-out">
              <div className="text-center space-y-7 mb-4">
                <h3 className="text-xl font-semibold">Configuration 2FA</h3>
                <img
                  src={qrCodeData}
                  alt="QR Code 2FA"
                  className="mx-auto w-48 h-48 rounded-3xl shadow-lg mb-4 bg-white p-1 border-2 border-gray-200"
                  loading="lazy"
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
                    <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>}>
                      <LoadCanvasTemplate reloadColor="red" />
                    </Suspense>
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
                <div className="flex items-center space-x-2 mt-10 gap-20">
                  <button
                    type="button"
                    className="mx-auto flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={() => setAuthStep('2fa')}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="mx-auto flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? <Spinner /> : 'Vérifier le code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      });
    }, 100);
  });
});

const SecurityTab = ({ user, handleInputChange }) => {
  const [twoFADigits, setTwoFADigits] = useState(['', '', '', '', '', '']);
  const digitsRefs = useRef([]);
  const [qrCodeData, setQrCodeData] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [authStep, setAuthStep] = useState('initial');
  const [captchaValue, setCaptchaValue] = useState('');
  const [countEchec2FACode, setCountEchec2FACode] = useState(0);
  const [tempToken, setTempToken] = useState(null);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {

    if (user && user.twoFAEnabled !== undefined) {
      setTwoFactorAuth(user.twoFAEnabled);
    }
  }, [user]);

  useEffect(() => {
    if (countEchec2FACode >= 2) {

      const initCaptcha = async () => {
        try {

          const LoadCaptchaEngineFn = await loadCaptchaEngine;
          LoadCaptchaEngineFn(6, '#f9fafb');
        } catch (error) {
          console.error('Error loading CAPTCHA engine:', error);
        }
      };

      initCaptcha();
    }
  }, [countEchec2FACode]);

  const handleDigitChange = (index, value) => {

    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...twoFADigits];
    newDigits[index] = value;
    setTwoFADigits(newDigits);


    if (value && index < 5) {
      digitsRefs.current[index + 1].focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {

    if (e.key === 'Backspace') {

      if (twoFADigits[index] !== '') {
        const newDigits = [...twoFADigits];
        newDigits[index] = '';
        setTwoFADigits(newDigits);

      }

      else if (index > 0) {
        const newDigits = [...twoFADigits];
        newDigits[index - 1] = '';
        setTwoFADigits(newDigits);
        digitsRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {

      digitsRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {

      digitsRefs.current[index + 1].focus();
    } else if (/^[0-9]$/.test(e.key)) {

      const newDigits = [...twoFADigits];
      newDigits[index] = e.key;
      setTwoFADigits(newDigits);


      if (index < 5) {
        e.preventDefault();
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


    const fullCode = twoFADigits.join('');

    if (fullCode.length !== 6) {
      return toast.error('Veuillez entrer un code à 6 chiffres');
    }

    setLoading(true);
    try {
      const { data } = await verify2FASetup({ code: fullCode, tempToken });

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
      setLoading(false);
    }
  };

  const handle2FASetup = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await setup2FA();

      if (response.status === 201) {
        setTempToken(response.data.tempToken);
        setQrCodeData(response.data.twoFASetup.qrCode);
        setManualSecret(response.data.twoFASetup.manualSecret);
        setAuthStep('setup');
      }
    } catch (error) {
      console.error("Erreur lors de la configuration 2FA:", error);
      toast.error("Erreur lors de la configuration 2FA");
    } finally {
      setLoading(false);
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

  const disable2FAHandler = async () => {
    try {
      const response = await disable2FA();
      if (response.status === 200) {
        setTwoFactorAuth(!twoFactorAuth);
        toast.success("L'authentification 2FA a été désactivée avec succès.");
      }
    } catch (error) {
      if (error.response) {
        console.error('Erreur serveur:', error.response.data);
        toast.error(error.response.data.message || 'Une erreur serveur est survenue.');
      } else if (error.request) {
        console.error('Erreur réseau:', error.request);
        toast.error('Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.');
      } else {
        console.error('Erreur inconnue:', error);
        toast.error('Une erreur inconnue est survenue. Veuillez réessayer.');
      }
    }
  };

  const handleSavePassword = async () => {

    setErrors({});

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
      setErrors({ general: 'Veuillez remplir tous les champs.' });
      return toast.error('Veuillez remplir tous les champs.');
    }


    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Les nouveaux mots de passe ne correspondent pas.' });
      return toast.error('Les nouveaux mots de passe ne correspondent pas.');
    }


    if (newPassword === currentPassword) {
      setErrors({ newPassword: 'Mot de passe identique au mot de passe actuel. Veuillez choisir un autre mot de passe.' });
      return toast.error(
        'Mot de passe identique au mot de passe actuel.\n Veuillez choisir un autre mot de passe.'
      );
    }


    if (newPassword.length < 12) {
      setErrors({ newPassword: 'Le nouveau mot de passe doit contenir au moins 12 caractères.' });
      return toast.error(
        'Le nouveau mot de passe doit contenir au moins 12 caractères.'
      );
    }

    setLoading(true);
    try {

      const owaspModule = await import('owasp-password-strength-test');
      const passwordTest = owaspModule.default;
      

      passwordTest.config({
        minLength: 12,
        minOptionalTestsToPass: 3
      });
      
      const testResult = passwordTest.test(newPassword);
      
      if (!testResult.strong) {
        const errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité: ' + 
          testResult.errors.join(', ');
        setErrors({ newPassword: errorMessage });
        setLoading(false);
        return toast.error(errorMessage);
      }

      await changePassword(currentPassword, newPassword);
      toast.success('Mot de passe mis à jour avec succès.');


      document.querySelector('input[placeholder="Entrez votre mot de passe actuel"]').value = '';
      document.querySelector('input[placeholder="Entrez un nouveau mot de passe"]').value = '';
      document.querySelector('input[placeholder="Confirmez le nouveau mot de passe"]').value = '';
    } catch (error) {
      if (error.response) {
        console.error('Erreur serveur:', error.response.data);
        setErrors({ currentPassword: error.response.data.message || 'Une erreur serveur est survenue.' });
        toast.error(error.response.data.message || 'Une erreur serveur est survenue.');
      } else if (error.request) {
        console.error('Erreur réseau:', error.request);
        setErrors({ general: 'Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.' });
        toast.error('Impossible de contacter le serveur. Veuillez vérifier votre connexion réseau.');
      } else {
        console.error('Erreur inconnue:', error);
        setErrors({ general: 'Une erreur inconnue est survenue. Veuillez réessayer.' });
        toast.error('Une erreur inconnue est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const Switch = ({ checked, onChange, disabled }) => {
    return (
      <button
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
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


  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;

    return (
      <p className="mt-1 text-sm text-red-600">
        {errors[field]}
      </p>
    );
  };

  ErrorMessage.propTypes = {
    field: PropTypes.string.isRequired
  };

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
              onChange={disable2FAHandler}
              disabled={!twoFactorAuth}
            />

            {!twoFactorAuth ? (
              <button
                onClick={e => handle2FASetup(e)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? <Spinner /> : 'Configurer'}
              </button>
            ) : (
              <button
                onClick={e => handle2FAReset(e)}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? <Spinner /> : 'Réinitialiser'}
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
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.currentPassword ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  handleInputChange(e);
                  if (errors.currentPassword || errors.general) {
                    setErrors({ ...errors, currentPassword: null, general: null });
                  }
                }}
              />
              <ErrorMessage field="currentPassword" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="Entrez un nouveau mot de passe"
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.newPassword ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  handleInputChange(e);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: null });
                  }
                }}
              />
              <ErrorMessage field="newPassword" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="Confirmez le nouveau mot de passe"
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  handleInputChange(e);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
              />
              <ErrorMessage field="confirmPassword" />
            </div>
            <ErrorMessage field="general" />
            <button
              onClick={handleSavePassword}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Enregistrer le nouveau mot de passe'}
            </button>
          </div>
        </div>
      </div>

      {authStep === 'setup' && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 w-full max-w-md flex flex-col items-center">
              <Spinner />
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        }>
          <TwoFASetupModal
            qrCodeData={qrCodeData}
            manualSecret={manualSecret}
            handle2FASubmit={handle2FASubmit}
            countEchec2FACode={countEchec2FACode}
            captchaValue={captchaValue}
            setCaptchaValue={setCaptchaValue}
            twoFADigits={twoFADigits}
            handleDigitChange={handleDigitChange}
            handleDigitKeyDown={handleDigitKeyDown}
            handleDigitPaste={handleDigitPaste}
            digitsRefs={digitsRefs}
            setAuthStep={setAuthStep}
            loading={loading}
          />
        </Suspense>
      )}
    </div>
  );
};

SecurityTab.propTypes = {
  user: PropTypes.object.isRequired,
  setUser: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default SecurityTab;