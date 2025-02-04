import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import NavigationBar from './components/NavigationBar'
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';


function App() {
  return (
    <Router>
      <div>
        {/* Main Content */}
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<Dashboard Content="Profile" />} />
            <Route path="/courses-library" element={<Dashboard Content="CoursesLibrary" />} />
            <Route path="*" element={<Dashboard Content="Home" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;