/**
 * @fileoverview Composant de tutoriel pour le lecteur de cours qui fournit des guides
 * contextuels basés sur le rôle de l'utilisateur (Étudiant, Enseignant, ou Administrateur).
 */

import { useState } from 'react';
import Tutorial from '../components/Tutorial';
import { useTutorial } from '../contexts/TutorialContext';
import PropTypes from 'prop-types';

/**
 * Composant de tutoriel pour le lecteur de cours qui affiche des étapes d'instruction
 * différentes selon le rôle de l'utilisateur.
 *
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {('Etudiant'|'Enseignant'|'Administrateur')} props.role - Le rôle de l'utilisateur qui détermine les étapes du tutoriel à afficher
 * @returns {JSX.Element} Un composant de tutoriel avec un bouton pour lancer ou revoir le tutoriel
 * 
 * @example
 * <CourseReaderTutorial role="Etudiant" />
 */
const CourseReaderTutorial = ({ role }) => {
  const [runTutorial, setRunTutorial] = useState(false);
  const { isTutorialCompleted, resetTutorial } = useTutorial();
  const tutorialId = 'course-reader';

  /**
   * Étapes communes du tutoriel affichées pour tous les rôles d'utilisateur.
   * @type {Array<Object>}
   */
  const commonSteps = [
    {
      target: 'body',
      content: 'Bienvenue dans le lecteur de cours ! Voici comment naviguer et interagir avec le contenu du cours.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.course-title',
      content: 'Voici le titre du cours que vous consultez actuellement.',
      placement: 'bottom',
    },
  ];

  /**
   * Étapes du tutoriel spécifiques aux administrateurs.
   * @type {Array<Object>}
   */
  const adminSteps = [
    {
      target: '.admin-panel',
      content: 'Accédez aux outils d\'administration pour gérer les cours et les utilisateurs.',
      placement: 'right',
    },
  ];

  /**
   * Étapes du tutoriel spécifiques aux étudiants.
   * @type {Array<Object>}
   */
  const studentSteps = [
    {
      target: '.video-player',
      content: 'Regardez le contenu vidéo du cours ici. Vous pouvez mettre en pause, avancer ou reculer selon vos besoins.',
      placement: 'bottom',
    },
    {
      target: '.documents-section',
      content: 'Consultez les documents associés au cours dans cette section.',
      placement: 'top',
    },
    {
      target: '.download-button',
      content: 'Téléchargez les documents pour les consulter hors ligne.',
      placement: 'left',
    },
  ];

  /**
   * Étapes du tutoriel spécifiques aux enseignants.
   * @type {Array<Object>}
   */
  const teacherSteps = [
    {
      target: '.teacher-tools',
      content: 'Utilisez les outils pour ajouter ou modifier le contenu du cours.',
      placement: 'right',
    },
  ];

  /**
   * Toutes les étapes du tutoriel combinées en fonction du rôle de l'utilisateur.
   * @type {Array<Object>}
   */
  const steps = [
    ...commonSteps,
    ...(role === 'Administrateur' ? adminSteps : []),
    ...(role === 'Etudiant' ? studentSteps : []),
    ...(role === 'Enseignant' ? teacherSteps : []),
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

CourseReaderTutorial.propTypes = {
  role: PropTypes.oneOf(['Etudiant', 'Enseignant', 'Administrateur']).isRequired,
};

export default CourseReaderTutorial;