import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import NavigationBar from './components/NavigationBar'
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';

const routeConfig = [
  { path: '/', content: 'Home' },
  { path: '/profile', content: 'Profile' },
  { path: '/courses-library', content: 'Courses' },

];


function App() {
  return (
    <Router>
      <div>
        {/* Main Content */}
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {routeConfig.map((route, index) => (
              <Route key={index} path={route.path} element={<Dashboard Content={route.content} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;