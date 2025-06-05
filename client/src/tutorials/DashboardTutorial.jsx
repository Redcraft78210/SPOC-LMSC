import { useState, useEffect } from 'react';
import Tutorial from '../components/Tutorial';
import { useTutorial } from '../contexts/TutorialContext';
import PropTypes from 'prop-types';

const DashboardTutorial = ({ userRole, name }) => {
  const [runTutorial, setRunTutorial] = useState(false);
  const { isTutorialCompleted, completeTutorial } = useTutorial();
  const tutorialId = `dashboard-${userRole.toLowerCase()}`;
  
  // Run the tutorial automatically for first-time users
  useEffect(() => {
    if (!isTutorialCompleted(tutorialId)) {
      setRunTutorial(true);
    }
  }, [isTutorialCompleted, tutorialId]);
  
  // Define steps based on user role
  const getStepsForRole = () => {
    const commonSteps = [
      {
        target: 'body',
        content: `Bienvenue sur votre tableau de bord ${name} ! Nous allons vous présenter les fonctionnalités principales.`,
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: 'navbar',
        content: 'Utilisez cette barre latérale pour naviguer entre les différentes sections de la plateforme.',
        placement: 'right',
      },
      {
        target: '.settings',
        content: 'Accédez à votre profil et aux paramètres du compte ici.',
        placement: 'bottom',
      }
    ];
    
    // Role-specific steps
    if (userRole === 'Etudiant') {
      return [
        ...commonSteps,
        {
          target: '.courses-link',
          content: 'Accédez à vos cours ici.',
          placement: 'right',
        },
        {
          target: '.progress-card',
          content: 'Consultez votre progression dans les différents cours.',
          placement: 'bottom',
        }
      ];
    } else if (userRole === 'Professeur') {
      return [
        ...commonSteps,
        {
          target: '.courses-management',
          content: 'Créez et gérez vos cours ici.',
          placement: 'right',
        },
        {
          target: '.live-management',
          content: 'Créez et gérez vos sessions live.',
          placement: 'right',
        }
      ];
    } else if (userRole === 'Administrateur') {
      return [
        ...commonSteps,
        {
          target: '.user-management',
          content: 'Gérez les utilisateurs de la plateforme.',
          placement: 'right',
        },
        {
          target: '.class-management',
          content: 'Créez et gérez les classes.',
          placement: 'right',
        },
        {
          target: '.quick-actions',
          content: 'Utilisez ces actions rapides pour accéder aux fonctionnalités importantes.',
          placement: 'right',
        }
      ];
    }
    
    return commonSteps;
  };
  
  return (
    <Tutorial 
      steps={getStepsForRole()} 
      tutorialId={tutorialId} 
      run={runTutorial}
      onFinish={() => {
        // You could save a user preference here
        completeTutorial(tutorialId);
      }}
    />
  );
};

DashboardTutorial.propTypes = {
  userRole: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default DashboardTutorial;