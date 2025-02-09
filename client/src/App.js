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

];


function App() {

  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isfirstAuth, setFirstAuth] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false); // Update state to handle logout

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          let clientTime = new Date().getTime();

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

  const handleSetAuth = (authData) => {
    const token = authData;
    try {
      const decodedToken = jwtDecode(token);
      setAuth(decodedToken);
      if (decodedToken.isFirstConnexion) {
        setFirstAuth(true);
      }
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('authToken');
    setIsLoggedOut(true);  // Update state to trigger navigation
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isLoggedOut && window.location.pathname !== "/sign" && <Navigate to="/sign" />}
      <div>
        {/* Main Content */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={auth ? <Dashboard Content={Home} /> : <Home />} />
            <Route path="/sign"
              element={auth ? <Navigate to='/' /> : <Sign setAuth={handleSetAuth} unsetLoggedOut={setIsLoggedOut} />}
            />
            {auth && routeConfig.map((route, index) => (
              <Route key={index} path={route.path} element={<Dashboard Content={route.content} />} />
            ))}
            <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;