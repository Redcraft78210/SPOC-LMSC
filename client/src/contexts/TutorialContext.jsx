import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
  const [completedTutorials, setCompletedTutorials] = useState({});
  

  useEffect(() => {
    const savedTutorials = localStorage.getItem('completedTutorials');
    if (savedTutorials) {
      setCompletedTutorials(JSON.parse(savedTutorials));
    }
  }, []);
  

  useEffect(() => {
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }, [completedTutorials]);
  

  const completeTutorial = (tutorialId) => {
    setCompletedTutorials(prev => ({
      ...prev,
      [tutorialId]: true
    }));
  };
  

  const isTutorialCompleted = (tutorialId) => {
    return !!completedTutorials[tutorialId];
  };
  

  const resetTutorial = (tutorialId) => {
    setCompletedTutorials(prev => {
      const newState = { ...prev };
      delete newState[tutorialId];
      return newState;
    });
  };
  

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