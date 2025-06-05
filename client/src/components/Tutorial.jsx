import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import PropTypes from 'prop-types';
import { useTutorial } from '../contexts/TutorialContext';

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

  useEffect(() => {
    if (run && !isTutorialCompleted(tutorialId)) {
      setRunTutorial(true);
    }
  }, [run, tutorialId, isTutorialCompleted]); // test

  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTutorial(false);
      completeTutorial(tutorialId);
      onFinish();
    }
  };

  const defaultStyles = {
    options: {
      zIndex: 10000,
      primaryColor: '#3b82f6', // blue-500
      textColor: '#1f2937',    // gray-800
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