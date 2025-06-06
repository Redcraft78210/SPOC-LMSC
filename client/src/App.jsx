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


const LoadingFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="animate-pulse text-gray-600">Chargement...</p>
    </div>
  </div>
);


let APP_STATUS = 'MAINTENANCE';



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

const publicRouteConfig = [
  { path: '/', content: 'Home' },
  { path: '/about', content: 'About' },
  { path: '/sign', content: 'Sign' },
  { path: '/contact', content: 'Contact' },
  { path: '/terms', content: 'Terms' },
  { path: '/legal', content: 'Legal' },
  { path: '/privacy', content: 'Privacy' },
];

function AppWrapper() {
  return (
    <Router>
      <TutorialProvider>
        <App />
      </TutorialProvider>
    </Router>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!auth && !loading && (sessionStorage.getItem('authToken') || localStorage.getItem('authToken'))) {
      handleLogout();
    }
  }, [auth, loading]);

  useEffect(() => {
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

  const handleLogout = () => {
    setAuth(null);
    setRole(null);
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  };

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
