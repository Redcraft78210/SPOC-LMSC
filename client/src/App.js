import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Components
import Home from './pages/Home';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import CompTest from './pages/CompTest';
import CoursesLibrary from './pages/CoursesLibrary';

function App() {
  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/comp-test" element={<CompTest />} />
            <Route path="/courses-library" element={<CoursesLibrary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
