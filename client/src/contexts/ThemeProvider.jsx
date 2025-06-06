
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import ThemeContext from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme !== null) {
      return JSON.parse(storedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
