import React, { useState, useEffect } from 'react';
import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './index.css';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Sign from './pages/Sign';
import Logout from './components/Logout';
import NotFound from './pages/NotFound';

const routeConfig = [
  { path: '/dashboard', content: 'Home' },
  { path: '/profile', content: 'Profile' },
  { path: '/courses-library', content: 'Courses' },
  { path: '/lives', content: 'Lives' },
];

function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [isFirstAuth, setFirstAuth] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isProf, setIsProf] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const clientTime = Date.now();
          if (decodedToken.exp * 1000 < clientTime) {
            handleLogout();
          } else {
            setAuth(decodedToken);
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
  }, []);

  const handleSetAuth = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      setAuth(decodedToken);
      decodedToken.isFirstConnexion && setFirstAuth(true);
      decodedToken.isProf && setIsProf(true);

      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('authToken');
    setIsLoggedOut(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {/* If logged out and not on the sign page, navigate to "/sign" */}
      {isLoggedOut && window.location.pathname !== "/sign" && <Navigate to="/sign" replace />}
      <div className="container mt-4">
        <div>Current route: {window.location.pathname}</div>
        <Routes>
          {/* Home route: if authenticated, show Dashboard with "Home" content; otherwise, show Home */}
          <Route path="/" element={auth ? <Dashboard Content="Home" isProf={isProf} /> : <Home />} />
          <Route
            path="/sign"
            element={
              auth ? (
                <Navigate to="/" replace />
              ) : (
                <Sign setAuth={handleSetAuth} unsetLoggedOut={setIsLoggedOut} />
              )
            }
          />
          {/* Additional routes available only when authenticated */}
          {auth &&
            routeConfig.map((route, index) => (
              <Route key={index} path={route.path} element={<Dashboard Content={route.content} isProf={isProf} />} />
            ))}
          <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
