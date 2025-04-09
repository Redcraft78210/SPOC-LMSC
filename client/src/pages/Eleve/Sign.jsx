import React, { useState, useEffect } from "react";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  LoadCanvasTemplateNoReload,
  validateCaptcha,
} from "react-simple-captcha";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SubmitButton from "../../components/SubmitButton";
import Logo from "../../Logo";
import { Eye, EyeOff } from "lucide-react";

// Configuration des messages d'erreur
const errorMessages = {
  "auth/invalid-credentials": "Identifiants incorrects",
  "auth/email-exists": "Cet email est deja utilisé",
  "auth/user-not-found": "Utilisateur introuvables",
  "auth/username-exists": "Ce nom d'utilisateur est deja utilisé",
  "auth/2fa-required": "Vérification 2FA requise",
  "auth/invalid-2fa-code": "Code de double authentification incorrect",
  "auth/weak-password":
    "Le mot de passe doit contenir au moins 12 caractères, une majuscule et un caractère spécial",
  default: "Une erreur est survenue. Veuillez réessayer.",
};

const Sign = ({ setAuth, unsetLoggedOut }) => {
  const navigate = useNavigate();
  // Error handling
  const [error, setError] = useState(null);

  // Authentication state
  const [isSignUpForm, setIsSignUpForm] = useState(
    new URLSearchParams(window.location.search).get("mode") === "signup"
  );
  const [authStep, setAuthStep] = useState("initial");
  const [tempToken, setTempToken] = useState(null);
  const [twoFACode, setTwoFACode] = useState("");

  // User information
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 2FA setup
  const [qrCodeData, setQrCodeData] = useState("");
  const [manualSecret, setManualSecret] = useState("");

  // Form submission control
  const [captchaValue, setCaptchaValue] = useState("");
  const [lastSubmit, setLastSubmit] = useState(0);

  // Redirection si déjà authentifié
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    setLastSubmit(0); // Réinitialise le délai anti-double clic
  }, [authStep]);

  useEffect(() => {
    loadCaptchaEnginge(6); // Initialize with 6-character CAPTCHA
  }, []);

  // Modification dans le useEffect de gestion du rafraîchissement 2FA
  useEffect(() => {
    let intervalId;
    let timeoutId;

    const refresh2FASetup = async () => {
      try {
        const { data } = await axios.post(
          "https://localhost:8443/api/auth/refresh-2fa-setup",
          {
            tempToken: tempToken?.value,
            twoFASetup: {
              qrCode: qrCodeData,
              manualSecret: manualSecret,
            },
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
        setError("La configuration 2FA a expiré. Veuillez réessayer.");
        setAuthStep("initial");
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

          // Planification du premier rafraîchissement après le délai calculé
          timeoutId = setTimeout(() => {
            refresh2FASetup();
          }, timeUntilRefresh);

          // Mise en place de l'intervalle
          intervalId = setInterval(refresh2FASetup, timeUntilRefresh);
        }
      } catch (error) {
        console.error("Erreur de décodage JWT:", error);
        setError("Token invalide. Veuillez réessayer.");
        setAuthStep("initial");
      }
    }

    return () => {
      intervalId && clearInterval(intervalId);
      timeoutId && clearTimeout(timeoutId);
    };
  }, [tempToken?.value]);

  // Validation du mot de passe
  const validatePassword = (pw) => {
    return /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{12,})/.test(pw);
  };

  // Soumission du formulaire principal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setError(null);

    if (isSignUpForm && password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas");
    }

    if (isSignUpForm && !validatePassword(password)) {
      return setError(errorMessages["auth/weak-password"]);
    }

    try {
      const endpoint = isSignUpForm
        ? "https://localhost:8443/api/auth/register"
        : "https://localhost:8443/api/auth/login";

      const body = isSignUpForm
        ? { email, username, password, name, surname }
        : { email, password };

      const { data } = await axios.post(endpoint, body);

      if (data.requires2FA || data.twoFASetup) {
        setAuthStep(data.twoFASetup ? "2fa-setup" : "2fa-verification");
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
    } catch (error) {
      const errorCode = error.response?.data?.code || "default";
      setError(errorMessages[errorCode] || errorMessages.default);
    }
  };

  // Soumission du code 2FA
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 2000) return;
    setLastSubmit(Date.now());
    setError(null);

    try {
      const endpoint =
        authStep === "2fa-verification"
          ? "https://localhost:8443/api/auth/verify-2fa"
          : "https://localhost:8443/api/auth/activate-2fa";

      const { data } = await axios.post(endpoint, {
        tempToken: tempToken?.value,
        code: twoFACode,
        setup: authStep === "2fa-setup",
      });

      if (data.token) {
        handleAuthSuccess(data.token);
      }
    } catch (error) {
      const errorCode = error.response?.data?.message || "default";
      setError(errorMessages[errorCode] || errorMessages.default);
    }
  };

  // Gestion de la réussite de l'authentification
  const handleAuthSuccess = (token) => {
    setAuth(token);
    unsetLoggedOut(false);
    sessionStorage.setItem("authToken", token);
    navigate("/dashboard");
  };

  // Basculer entre inscription/connexion
  const toggleAuthMode = () => {
    setIsSignUpForm(!isSignUpForm);
    setError(null);
    if (isSignUpForm) {
      setUsername("");
      setName("");
      setConfirmPassword("");
    }
  };

  // Rendu du contenu 2FA
  const render2FAContent = () => (
    <form onSubmit={handle2FASubmit} className="w-full space-y-8">
      {authStep === "2fa-setup" && (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Configuration 2FA</h3>
          <img
            src={qrCodeData}
            alt="QR Code 2FA"
            className="mx-auto w-48 h-48 rounded-3xl shadow-lg mb-4 bg-white p-1 border-2 border-gray-200 focus:ring-2 focus:ring-[#002B2F] focus:outline-none focus:border-[#002B2F] focus:shadow-lg focus:shadow-[#002B2F]/50 transition-all ease-in-out duration-300"
            aria-describedby="qrCodeDesc"
          />
          <p id="qrCodeDesc" className="text-sm text-gray-600">
            Scannez le QR Code avec votre application d'authentification ou
            entrez ce code manuellement :
          </p>
          <div className="font-mono bg-gray-100 p-2 rounded-lg">
            {manualSecret}
          </div>
        </div>
      )}

      <div className="relative">
        <label htmlFor="2faCode" className="sr-only">
          Code 2FA
        </label>
        <input
          id="2faCode"
          type="text"
          placeholder="Code à 6 chiffres"
          value={twoFACode}
          onChange={(e) =>
            setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
          required
          autoComplete="off"
          aria-invalid={error ? "true" : "false"}
          aria-describedby="2faError"
        />
      </div>

      <SubmitButton
        type="submit"
        onSubmission={handle2FASubmit}
        className="w-full py-4 text-lg md:text-xl font-semibold text-white bg-[#002B2F] rounded-lg hover:bg-[#00474F] transition-colors"
      >
        {authStep === "2fa-setup" ? "Activer la 2FA" : "Vérifier le code"}
      </SubmitButton>

      {authStep !== "2fa-setup" && (
        <p className="text-center text-base md:text-lg">
          <button
            type="button"
            onClick={() => {
              setAuthStep("initial");
              setTempToken(null);
            }}
            className="font-bold underline hover:text-[#00474F] transition-colors"
          >
            Retour
          </button>
        </p>
      )}
    </form>
  );

  // Rendu du formulaire initial
  const renderInitialForm = () => (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      {isSignUpForm && (
        <>
          <div className="relative">
            <label htmlFor="username" className="sr-only">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
              required
              minLength="3"
            />
          </div>
          <div className="relative flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label htmlFor="name" className="sr-only">
                Prénom
              </label>
              <input
                id="name"
                type="text"
                placeholder="Prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
                required
              />
            </div>
            <div className="w-full">
              <label htmlFor="surname" className="sr-only">
                Nom
              </label>
              <input
                id="surname"
                type="text"
                placeholder="Nom"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="relative">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
          required
          pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
          aria-describedby="emailError"
        />
      </div>

      <div className="relative">
        <label htmlFor="password" className="sr-only">
          Mot de passe
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
          required
          aria-describedby="passwordError"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-4 top-4 text-xl text-[#002B2F] ${
            showPassword ? "hover:text-[#c52c1a]" : "hover:text-[#277840]"
          } transition-colors`}
          aria-label={
            showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"
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
          <label htmlFor="confirmPassword" className="sr-only">
            Confirmation mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
            required
          />
        </div>
      )}

      {/* Add CAPTCHA display */}
      <div className="captcha-container">
        <LoadCanvasTemplate />
      </div>

      <div className="relative">
        <label htmlFor="captcha" className="sr-only">
          CAPTCHA Verification
        </label>
        <input
          id="captcha"
          type="text"
          placeholder="Enter the CAPTCHA text"
          value={captchaValue}
          onChange={(e) => setCaptchaValue(e.target.value)}
          className="w-full h-14 px-6 py-3 text-base md:text-lg bg-white border-2 rounded-lg focus:ring-2 focus:ring-[#002B2F]"
          required
        />
      </div>

      <SubmitButton
        type="submit"
        onSubmission={handleSubmit}
        className="w-full py-4 text-lg md:text-xl font-semibold text-white bg-[#002B2F] rounded-lg hover:bg-[#00474F] transition-colors"
      >
        {isSignUpForm ? "S'inscrire" : "Se connecter"}
      </SubmitButton>

      <div className="flex items-center space-x-3">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-5 h-5 md:w-6 md:h-6 text-[#002B2F] rounded focus:ring-[#002B2F]"
        />
        <label htmlFor="rememberMe" className="text-base md:text-lg">
          Se souvenir de moi
        </label>
      </div>

      <p className="text-center text-base md:text-lg">
        {isSignUpForm ? "Déjà un compte ? " : "Pas de compte ? "}
        <button
          type="button"
          onClick={toggleAuthMode}
          className="font-bold underline hover:text-[#00474F] transition-colors"
          aria-label={
            isSignUpForm ? "Aller à la connexion" : "Aller à l'inscription"
          }
        >
          {isSignUpForm ? "Connectez-vous ici" : "Créez-en ici"}
        </button>
      </p>
    </form>
  );

  return (
    <section className="flex w-screen h-screen">
      <div className="m-auto w-full max-w-2xl px-4">
        <section className="border-2 bg-gray-50 rounded-xl shadow-lg">
          <div className="mx-auto space-y-8 p-8 md:p-12">
            <div className="text-[#002B2F] text-center w-full">
              <a href="/" className="flex items-center justify-center">
                <Logo
                  fillColor="#002B2F"
                  className="w-24 h-24 md:w-32 md:h-32"
                  aria-hidden="true"
                />
                <span className="sr-only">Page d'accueil</span>
              </a>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center">
              {authStep === "2fa-verification" && "Vérification 2FA"}
              {authStep === "2fa-setup" && "Activation 2FA"}
              {authStep === "initial" &&
                (isSignUpForm ? "Inscription" : "Connexion")}
            </h1>

            {error && (
              <div
                id="formError"
                className="text-red-600 text-lg text-center font-medium"
                role="alert"
              >
                {error}
              </div>
            )}

            {authStep.startsWith("2fa")
              ? render2FAContent()
              : renderInitialForm()}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Sign;
