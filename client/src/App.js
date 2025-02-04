import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import NavigationBar from './components/NavigationBar'
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

const routeConfig = [
  { path: '/', content: 'Home' },
  { path: '/profile', content: 'Profile' },
  { path: '/courses-library', content: 'Courses' },
  { path: '*', content: '' },
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;