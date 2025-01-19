import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

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
            <Route path="/courses" element={<Courses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
