/**
 * Application principale SPOC-LMSC gérant l'authentification et le routage.
 * @module App
 */
import React, { useState, useEffect, Suspense } from 'react';
import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { TutorialProvider } from './contexts/TutorialContext';


// Importations avec chargement paresseux des composants
const About = React.lazy(() => import('./pages/Public/About'));
const Contact = React.lazy(() => import('./pages/Public/Contact'));
const Terms = React.lazy(() => import('./pages/Public/TermsOfUse'));
const Legal = React.lazy(() => import('./pages/Public/LegalNotice'));
const Privacy = React.lazy(() => import('./pages/Public/PrivacyPolicy'));
const FirstLogin = React.lazy(() => import('./pages/FirstLogin'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Home = React.lazy(() => import('./pages/Public/Home'));
const Logout = React.lazy(() => import('./components/Logout'));
const MaintenanceBanner = React.lazy(() => import('./pages/Public/Maintenance'));
const NotFound = React.lazy(() => import('./pages/Public/NotFound'));
const Sign = React.lazy(() => import('./pages/Public/Sign'));


/**
 * Composant de secours affiché pendant le chargement des composants.
 * @returns {JSX.Element} Composant d'interface utilisateur d'état de chargement
 */
const LoadingFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="animate-pulse text-gray-600">Chargement...</p>
    </div>
  </div>
);


/**
 * @type {string}
 * @description Définit si l'application est en mode maintenance ou opérationnelle.
 * En mode maintenance, l'application affiche une bannière de maintenance et empêche l'accès aux routes protégées.
 * En mode normal, l'application fonctionne normalement avec authentification et routage.
 * @example
 * // Pour activer le mode maintenance, définissez APP_STATUS à 'MAINTENANCE'
 * APP_STATUS = 'MAINTENANCE';
 * // Pour revenir au mode normal, définissez APP_STATUS à une chaîne vide ou à 'OPERATIONAL'
 * APP_STATUS = '';
 * @see MaintenanceBanner pour l'affichage de la bannière de maintenance
 * @see App pour la logique de routage et d'authentification
 */
let APP_STATUS = '';


/**
 * @type {Array<{path: string, content: string}>}
 * @description Configuration des routes protégées nécessitant une authentification.
 */
const routeConfig = [

  { path: '/dashboard', content: 'Home' },


  { path: '/course-reader', content: 'CourseReader' },
  { path: '/courses-library', content: 'CoursesLibrary' },
  { path: '/courses-managment', content: 'CoursesManagement' },


  { path: '/classes-management', content: 'ClassManagement' },


  { path: '/users-management', content: 'UserManagement' },
  { path: '/profile', content: 'Profile' },


  { path: '/video-manager', content: 'VideoManager' },
  { path: '/document-manager', content: 'DocumentManager' },
  { path: '/video-recording', content: 'VideoRecording' },


  { path: '/forum', content: 'Forum' },
  { path: '/mailbox', content: 'Mailbox' },


  { path: '/liveViewer', content: 'LiveViewer' },


  { path: '/theme-settings', content: 'ThemeSettings' },
  { path: '/settings', content: 'Settings' },
];

/**
 * @type {Array<{path: string, content: string}>}
 * @description Configuration des routes publiques accessibles sans authentification.
 */
const publicRouteConfig = [
  { path: '/', content: 'Home' },
  { path: '/about', content: 'About' },
  { path: '/sign', content: 'Sign' },
  { path: '/contact', content: 'Contact' },
  { path: '/terms', content: 'Terms' },
  { path: '/legal', content: 'Legal' },
  { path: '/privacy', content: 'Privacy' },
];

/**
 * Composant d'encapsulation fournissant le routeur et le contexte de tutoriel.
 * @returns {JSX.Element} Application avec Router et TutorialProvider
 */
function AppWrapper() {
  return (
    <Router>
      <TutorialProvider>
        <App />
      </TutorialProvider>
    </Router>
  );
}

/**
 * Composant principal gérant l'authentification et le routage.
 * Gère la redirection vers la première connexion, les routes protégées et publiques.
 * @returns {JSX.Element} Interface principale avec routage conditionnel
 */
function App() {
  /**
   * @type {Object|null}
   * @description État contenant les informations d'authentification décodées du JWT
   */
  const [auth, setAuth] = useState(null);
  
  /**
   * @type {boolean}
   * @description État indiquant si l'application est en cours de chargement
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * @type {string|null}
   * @description Rôle de l'utilisateur authentifié
   */
  const [role, setRole] = useState(null);
  
  const location = useLocation();

  /**
   * Vérifie la cohérence entre l'état d'authentification et les jetons stockés
   */
  useEffect(() => {
    if (!auth && !loading && (sessionStorage.getItem('authToken') || localStorage.getItem('authToken'))) {
      handleLogout();
    }
  }, [auth, loading]);

  /**
   * Vérifie l'authenticité et la validité du jeton JWT
   */
  useEffect(() => {
    /**
     * Vérifie le jeton d'authentification stocké et met à jour l'état
     */
    const checkAuth = () => {
      const token =
        sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            handleLogout();
          } else {
            !auth && setAuth(decodedToken);
            setRole(decodedToken.role);
          }
        } catch (error) {
          console.error('Invalid token:', error);
          handleLogout();
        }
      } else {
        setAuth(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [auth, location]);

  /**
   * Configure l'authentification à partir d'un jeton JWT
   * @param {string} token - Jeton JWT d'authentification
   * @throws {Error} Erreur si le décodage du jeton échoue
   */
  const handleSetAuth = token => {
    try {
      const decodedToken = jwtDecode(token);
      setAuth(decodedToken);
      setRole(decodedToken.role);
    } catch (error) {
      console.error('Error decoding token:', error);
      handleLogout();
    }
  };

  /**
   * Déconnecte l'utilisateur en supprimant les jetons et réinitialisant les états
   */
  const handleLogout = () => {
    setAuth(null);
    setRole(null);
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  };

  // Rendu conditionnel basé sur l'état de l'application
  if (APP_STATUS === 'MAINTENANCE') {
    return (
      <MaintenanceBanner
        companyName="SPOC LMSC"
        estimatedDuration="2:00 PM - 4:00 PM UTC"
        contactEmail="webmaster@spoc.lmsc"
      />
    );
  }

  if (loading) {
    return <LoadingFallback />;
  }

  if (auth && auth.firstLogin) {
    return (
      <Routes>
        <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
        <Route
          path="*"
          element={
            <FirstLogin
              token={sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}
              setAuth={handleSetAuth}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      {publicRouteConfig.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={<LoadingFallback />}>
              {(() => {
                switch (route.content) {
                  case 'Home':
                    return <Home />;
                  case 'About':
                    return <About />;
                  case 'Sign':
                    return auth ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Sign setAuth={handleSetAuth} />
                    );
                  case 'Contact':
                    return <Contact />;
                  case 'Terms':
                    return <Terms />;
                  case 'Legal':
                    return <Legal />;
                  case 'Privacy':
                    return <Privacy />;
                  default:
                    return <NotFound />;
                }
              })()}
            </Suspense>
          }
        />
      ))}
      {auth
        ? routeConfig.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Dashboard
                  content={route.content}
                  token={sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}
                  role={role}
                />
              }
            />
          ))
        : routeConfig.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<Navigate to="/sign" replace />}
            />
          ))}
      <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppWrapper;
