import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
  const [completedTutorials, setCompletedTutorials] = useState({});
  
  // Load completed tutorials from localStorage on mount
  useEffect(() => {
    const savedTutorials = localStorage.getItem('completedTutorials');
    if (savedTutorials) {
      setCompletedTutorials(JSON.parse(savedTutorials));
    }
  }, []);
  
  // Save completed tutorials to localStorage
  useEffect(() => {
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }, [completedTutorials]);
  
  // Mark a tutorial as completed
  const completeTutorial = (tutorialId) => {
    setCompletedTutorials(prev => ({
      ...prev,
      [tutorialId]: true
    }));
  };
  
  // Check if a tutorial has been completed
  const isTutorialCompleted = (tutorialId) => {
    return !!completedTutorials[tutorialId];
  };
  
  // Reset tutorial progress
  const resetTutorial = (tutorialId) => {
    setCompletedTutorials(prev => {
      const newState = { ...prev };
      delete newState[tutorialId];
      return newState;
    });
  };
  
  // Reset all tutorials
  const resetAllTutorials = () => {
    setCompletedTutorials({});
  };
  
  return (
    <TutorialContext.Provider 
      value={{ 
        completedTutorials, 
        completeTutorial, 
        isTutorialCompleted,
        resetTutorial,
        resetAllTutorials
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

TutorialProvider.propTypes = {
  children: PropTypes.node.isRequired
};