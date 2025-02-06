// src/contexts/ThemeContext.js
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);

  // You can define your CSS classes or variables based on the mode.
  const themeClass = darkMode ? 'dark-mode' : 'light-mode';

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, themeClass }}>
      {children}
    </ThemeContext.Provider>
  );
};
