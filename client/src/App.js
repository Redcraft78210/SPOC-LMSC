import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import NavigationBar from './components/NavigationBar'
import Dashboard from './pages/Dashboard';

const routeConfig = [
  { path: '/', content: 'Home' },
  { path: '/profile', content: 'Profile' },
  { path: '/comp-test', content: 'Test' },
  { path: '/courses-library', content: 'Courses' },
  { path: '/sign-in', content: 'Login' },
  { path: '/sign-up', content: 'Register' },
  { path: '*', content: '' },
];

function App() {
  return (
    <Router>
      <div>
        {/* Main Content */}
        <div className="container mt-4">
          <Routes>
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