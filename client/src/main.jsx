import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import your global styles

import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
