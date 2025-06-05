import { useState } from 'react';
import Tutorial from '../components/Tutorial';
import { Button } from '../components/ui/Button'; // Adapt to your actual Button component
import { useTutorial } from '../contexts/TutorialContext';

const CourseReaderTutorial = () => {
  const [runTutorial, setRunTutorial] = useState(false);
  const { isTutorialCompleted, resetTutorial } = useTutorial();
  const tutorialId = 'course-reader';
  
  const steps = [
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
    {
      target: '.complete-course-button',
      content: 'N\'oubliez pas de marquer le cours comme terminé une fois que vous l\'avez complété !',
      placement: 'top',
    },
  ];
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => {
            if (isTutorialCompleted(tutorialId)) {
              resetTutorial(tutorialId);
            }
            setRunTutorial(true);
          }}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          {isTutorialCompleted(tutorialId) ? 'Revoir le tutoriel' : 'Tutoriel'}
        </Button>
      </div>
      
      <Tutorial 
        steps={steps} 
        tutorialId={tutorialId} 
        run={runTutorial}
      />
    </>
  );
};

export default CourseReaderTutorial;