/**
 * @fileoverview
 * Composant gérant le tutoriel pas à pas pour la bibliothèque de cours.
 * Ce tutoriel guide l'utilisateur à travers l'interface de la bibliothèque
 * en expliquant les fonctionnalités principales de recherche et de filtrage.
 */

import { useState } from 'react';
import Tutorial from '../components/Tutorial';
import { useTutorial } from '../contexts/TutorialContext';

/**
 * Composant qui affiche un tutoriel guidé pour la bibliothèque de cours
 * 
 * @component
 * @returns {JSX.Element} Composant de tutoriel pour la bibliothèque de cours
 */
const CoursesLibraryTutorial = () => {
  /**
   * État contrôlant si le tutoriel est en cours d'exécution
   * @type {boolean}
   */
  const [runTutorial, setRunTutorial] = useState(false);
  
  /**
   * Contexte fournissant les fonctions de gestion des tutoriels
   * @type {Object}
   * @property {Function} isTutorialCompleted - Vérifie si un tutoriel spécifique a été complété
   * @property {Function} resetTutorial - Réinitialise l'état d'un tutoriel spécifique
   */
  const { isTutorialCompleted, resetTutorial } = useTutorial();
  
  /**
   * Identifiant unique pour ce tutoriel
   * @type {string}
   */
  const tutorialId = 'courses-library';
  
  /**
   * Configuration des étapes du tutoriel
   * @type {Array<Object>}
   */
  const steps = [
    {
      target: 'body',
      content: 'Bienvenue dans la Bibliothèque de Cours ! Nous allons vous montrer comment trouver et accéder aux cours.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#search',
      content: 'Vous pouvez rechercher des cours spécifiques en tapant ici.',
      placement: 'bottom',
    },
    {
      target: '.filter-type',
      content: 'Filtrez par type de contenu : cours ou sessions live.',
      placement: 'bottom',
    },
    {
      target: '.filter-professor',
      content: 'Filtrez les cours par professeur.',
      placement: 'bottom',
    },
    {
      target: '.filter-subject',
      content: 'Filtrez les cours par matière.',
      placement: 'bottom',
    },
    {
      target: '.course-card:first-child',
      content: 'Cliquez sur une carte de cours pour voir son contenu détaillé.',
      placement: 'top',
    },
  ];
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => {
            if (isTutorialCompleted(tutorialId)) {
              resetTutorial(tutorialId);
            }
            setRunTutorial(true);
          }}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          {isTutorialCompleted(tutorialId) ? 'Revoir le tutoriel' : 'Tutoriel'}
        </button>
      </div>
      
      <Tutorial 
        steps={steps} 
        tutorialId={tutorialId} 
        run={runTutorial}
      />
    </>
  );
};

export default CoursesLibraryTutorial;