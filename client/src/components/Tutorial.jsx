/**
 * @fileoverview
 * Composant de tutoriel interactif utilisant react-joyride
 * pour guider les utilisateurs à travers l'application.
 *
 * Ce composant encapsule la logique d'affichage d'un tutoriel étape par étape,
 * permettant de guider l'utilisateur dans l'interface. Il prend en charge la gestion
 * de l'état de complétion du tutoriel, la personnalisation des étapes et des styles,
 * ainsi que la localisation des boutons. L'intégration avec le contexte TutorialContext
 * permet de suivre la progression de l'utilisateur et d'éviter de répéter les tutoriels
 * déjà complétés.
 */

import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import PropTypes from 'prop-types';
import { useTutorial } from '../contexts/TutorialContext';

/**
 * Composant de tutoriel interactif pour guider les utilisateurs
 * 
 * @component
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.steps - Étapes du tutoriel au format react-joyride
 * @param {string} props.tutorialId - Identifiant unique du tutoriel pour suivre son état de complétion
 * @param {boolean} [props.run=false] - Détermine si le tutoriel doit démarrer automatiquement
 * @param {boolean} [props.continuous=true] - Si true, navigation continue entre les étapes
 * @param {boolean} [props.showSkipButton=true] - Affiche ou masque le bouton pour ignorer le tutoriel
 * @param {Function} [props.onFinish=()=>{}] - Fonction appelée lorsque le tutoriel est terminé ou ignoré
 * @param {Object} [props.styles={}] - Styles personnalisés pour le tutoriel
 * @returns {React.Component} Composant Joyride configuré
 * 
 * @example
 * // Utilisation basique du tutoriel
 * const steps = [
 *   {
 *     target: '.mon-element',
 *     content: 'Voici comment utiliser cette fonctionnalité',
 *     disableBeacon: true
 *   }
 * ];
 * 
 * <Tutorial 
 *   steps={steps}
 *   tutorialId="tutoriel-accueil"
 *   run={isFirstVisit}
 * />
 */
const Tutorial = ({
  steps,
  tutorialId,
  run = false,
  continuous = true,
  showSkipButton = true,
  onFinish = () => { },
  styles = {}
}) => {
  const [runTutorial, setRunTutorial] = useState(false);
  const { isTutorialCompleted, completeTutorial } = useTutorial();

  /**
   * Démarre le tutoriel s'il doit être exécuté et n'a pas déjà été complété
   */
  useEffect(() => {
    if (run && !isTutorialCompleted(tutorialId)) {
      setRunTutorial(true);
    }
  }, [run, tutorialId, isTutorialCompleted]);

  /**
   * Gère les événements de callback de Joyride
   * 
   * @param {Object} data - Données de l'événement Joyride
   * @param {string} data.status - Statut actuel du tutoriel
   */
  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTutorial(false);
      completeTutorial(tutorialId);
      onFinish();
    }
  };

  /**
   * Styles par défaut pour le tutoriel
   * @type {Object}
   */
  const defaultStyles = {
    options: {
      zIndex: 10000,
      primaryColor: '#3b82f6',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      arrowColor: '#ffffff',
    },
    tooltipContainer: {
      textAlign: 'left',
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
    },
    buttonBack: {
      marginRight: '0.5rem',
      color: '#4b5563',
    },
    buttonSkip: {
      color: '#9ca3af',
    },
  };

  /**
   * Fusion des styles par défaut avec les styles personnalisés
   * @type {Object}
   */
  const mergedStyles = {
    ...defaultStyles,
    ...styles
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={continuous}
      run={runTutorial}
      scrollToFirstStep
      showSkipButton={showSkipButton}
      steps={steps}
      styles={mergedStyles}
      disableScrolling={false}
      disableOverlayClose={true}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer'
      }}
    />
  );
};

Tutorial.propTypes = {
  steps: PropTypes.array.isRequired,
  tutorialId: PropTypes.string.isRequired,
  run: PropTypes.bool,
  continuous: PropTypes.bool,
  showSkipButton: PropTypes.bool,
  onFinish: PropTypes.func,
  styles: PropTypes.object
};

export default Tutorial;