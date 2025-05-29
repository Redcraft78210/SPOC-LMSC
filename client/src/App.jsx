import React, { useState, useEffect } from 'react';
import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import FirstLogin from './pages/FirstLogin';
import Dashboard from './pages/Dashboard'; // Utilisation du composant fusionné
import Home from './pages/Public/Home';
import Logout from './components/Logout';
import MaintenanceBanner from './pages/Public/Maintenance';
import NotFound from './pages/Public/NotFound';
import Sign from './pages/Public/Sign';


let APP_STATUS = '';
// Uncomment the following line to enable maintenance mode
// APP_STATUS = 'MAINTENANCE'; // Set to "MAINTENANCE" for maintenance mode

const routeConfig = [
  // Dashboard and Home
  { path: '/dashboard', content: 'Home' },

  // Course-related routes
  { path: '/course-reader', content: 'CourseReader' },
  { path: '/courses-library', content: 'CoursesLibrary' },
  { path: '/courses-managment', content: 'CoursesManagment' },

  // Class-related routes
  { path: '/classes-management', content: 'ClassManagement' },

  // User-related routes
  { path: '/users-management', content: 'UserManagement' },
  { path: '/profile', content: 'Profile' },

  // Media-related routes
  { path: '/video-manager', content: 'VideoManager' },
  { path: '/document-manager', content: 'DocumentManager' },

  // Communication-related routes
  { path: '/forum', content: 'Forum' },
  { path: '/mailbox', content: 'Mailbox' },

  // Live-related routes
  { path: '/liveViewer', content: 'LiveViewer' },

  // Settings
  { path: '/theme-settings', content: 'ThemeSettings' },
  { path: '/settings', content: 'Settings' },
];

const publicRouteConfig = [
  { path: '/', content: 'Home' },
  { path: '/about', content: 'About' },
  { path: '/sign', content: 'Sign' },
  { path: '/contact', content: 'Contact' },
];

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!auth && !loading && localStorage.getItem('authToken')) {
      handleLogout();
    }
  }, [auth, loading]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
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
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error decoding token:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setRole(null);
    localStorage.removeItem('authToken');
  };

  const Loader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="animate-pulse text-gray-600">Chargement...</p>
      </div>
    </div>
  );

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
    return <Loader />;
  }

  if (auth && auth.firstLogin) {
    return (
      <Routes>
        <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
        <Route
          path="*"
          element={
            <FirstLogin
              token={localStorage.getItem('authToken')}
              setAuth={handleSetAuth}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      {auth && auth.firstLogin && (
        <Route
          path="*"
          element={
            <FirstLogin
              token={localStorage.getItem('authToken')}
              setAuth={handleSetAuth}
            />
          }
        />
      )}
      {publicRouteConfig.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.path === '/sign' ? (
              auth ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Sign setAuth={handleSetAuth} />
              )
            ) : (
              React.createElement(
                route.content === 'Home'
                  ? Home
                  : route.content === 'About'
                    ? About
                    : Contact
              )
            )
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
                  token={localStorage.getItem('authToken')}
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
