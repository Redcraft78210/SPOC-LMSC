import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Contexte React pour gérer l'état des tutoriels complétés.
 * @type {React.Context}
 */
const TutorialContext = createContext();

/**
 * Hook personnalisé pour accéder au contexte des tutoriels.
 * @returns {Object} Le contexte des tutoriels contenant les fonctions et l'état.
 * @example
 * const { isTutorialCompleted, completeTutorial } = useTutorial();
 * if (!isTutorialCompleted('intro')) {
 *   // Afficher le tutoriel d'introduction
 * }
 */
export const useTutorial = () => useContext(TutorialContext);

/**
 * Fournisseur du contexte des tutoriels qui gère l'état et la persistance
 * des tutoriels complétés.
 * 
 * @param {Object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.children - Les composants enfants à envelopper.
 * @returns {JSX.Element} Le fournisseur du contexte avec les enfants.
 */
export const TutorialProvider = ({ children }) => {
  /**
   * État des tutoriels complétés.
   * @type {Object.<string, boolean>}
   */
  const [completedTutorials, setCompletedTutorials] = useState({});
  
  /**
   * Charge les tutoriels complétés depuis le localStorage au montage du composant.
   */
  useEffect(() => {
    const savedTutorials = localStorage.getItem('completedTutorials');
    if (savedTutorials) {
      setCompletedTutorials(JSON.parse(savedTutorials));
    }
  }, []);
  
  /**
   * Sauvegarde les tutoriels complétés dans le localStorage à chaque mise à jour.
   */
  useEffect(() => {
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }, [completedTutorials]);
  
  /**
   * Marque un tutoriel comme complété.
   * 
   * @param {string} tutorialId - L'identifiant unique du tutoriel.
   */
  const completeTutorial = (tutorialId) => {
    setCompletedTutorials(prev => ({
      ...prev,
      [tutorialId]: true
    }));
  };
  
  /**
   * Vérifie si un tutoriel a été complété.
   * 
   * @param {string} tutorialId - L'identifiant unique du tutoriel.
   * @returns {boolean} Vrai si le tutoriel est complété, faux sinon.
   */
  const isTutorialCompleted = (tutorialId) => {
    return !!completedTutorials[tutorialId];
  };
  
  /**
   * Réinitialise l'état d'un tutoriel spécifique.
   * 
   * @param {string} tutorialId - L'identifiant unique du tutoriel.
   */
  const resetTutorial = (tutorialId) => {
    setCompletedTutorials(prev => {
      const newState = { ...prev };
      delete newState[tutorialId];
      return newState;
    });
  };
  
  /**
   * Réinitialise l'état de tous les tutoriels.
   */
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