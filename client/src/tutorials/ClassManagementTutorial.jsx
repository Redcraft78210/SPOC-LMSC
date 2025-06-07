/**
 * @fileoverview
 * Composant de tutoriel interactif pour guider les utilisateurs à travers les fonctionnalités
 * de gestion des classes. Ce tutoriel explique comment créer, modifier, rechercher et supprimer 
 * des classes, ainsi que la gestion des vues et des actions groupées.
 */

import { useState } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import Tutorial from '../components/Tutorial';
import { HelpCircle } from 'lucide-react';

/**
 * Composant qui affiche un tutoriel interactif pour la gestion des classes.
 * Fournit un bouton d'aide fixe et un tutoriel étape par étape qui guide l'utilisateur
 * à travers l'interface de gestion des classes.
 * 
 * @component
 * @returns {JSX.Element} Composant de tutoriel avec un bouton d'aide fixe
 */
const ClassManagementTutorial = () => {
    const [runTutorial, setRunTutorial] = useState(false);
    const { resetTutorial } = useTutorial();

    /**
     * Définit les étapes du tutoriel de gestion des classes.
     * Chaque étape cible un élément spécifique de l'interface et affiche des instructions.
     * 
     * @type {Array<Object>}
     * @property {string} target - Sélecteur CSS de l'élément ciblé
     * @property {string} content - Texte explicatif à afficher
     * @property {string} placement - Position de l'info-bulle par rapport à l'élément ciblé
     * @property {boolean} [disableBeacon] - Si true, désactive le point lumineux initial
     * @property {Function} [isVisible] - Fonction qui détermine si l'étape doit être affichée
     */
    const tutorialSteps = [
        {
            target: 'body',
            content: 'Bienvenue dans la gestion des classes. Ce tutoriel vous guidera à travers les différentes fonctionnalités disponibles.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.container h1',
            content: 'Vous êtes dans la section Gestion des Classes où vous pouvez créer, modifier et gérer toutes les classes de la plateforme.',
            placement: 'bottom',
        },
        {
            target: 'button:has(.lucide-user-plus)',
            content: 'Cliquez ici pour créer une nouvelle classe. Vous pourrez définir son nom, sa description, l\'enseignant principal et les élèves qui y sont inscrits.',
            placement: 'bottom',
        },
        {
            target: '.relative.flex-1',
            content: 'Utilisez la barre de recherche pour trouver rapidement une classe par son nom ou sa description.',
            placement: 'bottom',
        },
        {
            target: '.toggleView',
            content: 'Basculez entre les vues liste et grille selon vos préférences. La liste offre plus de détails, tandis que la grille est plus compacte.',
            placement: 'bottom',
        },
        {
            target: 'table thead tr th:first-child, .grid.grid-cols-1 > div:first-child input[type="checkbox"]',
            content: 'Sélectionnez plusieurs classes pour effectuer des actions groupées comme la suppression.',
            placement: 'right',
        },
        {
            target: '.bg-blue-50',
            content: 'Lorsque des classes sont sélectionnées, cette barre apparaît et vous permet d\'effectuer des actions groupées.',
            placement: 'bottom',
            isVisible: () => document.querySelector('.bg-blue-50') !== null,
        },
        {
            target: 'table tbody tr:first-child td:last-child, .grid.grid-cols-1 > div:first-child .flex.gap-2',
            content: 'Pour chaque classe, vous pouvez la modifier ou la supprimer en utilisant ces boutons.',
            placement: 'left',
        },
        {
            target: 'button:has(.lucide-edit)',
            content: 'Modifiez les informations d\'une classe existante comme son nom, sa description, son enseignant principal ou ses élèves.',
            placement: 'top',
        },
        {
            target: 'button:has(.lucide-trash-2)',
            content: 'Supprimez définitivement une classe (action irréversible).',
            placement: 'top',
        },
        {
            target: '.px-6.py-4:has(.lucide-users)',
            content: 'Visualisez rapidement l\'enseignant principal et le nombre d\'élèves dans chaque classe.',
            placement: 'left',
        },
        {
            target: 'body',
            content: 'Dans le formulaire de création ou de modification d\'une classe, vous pouvez définir son nom, sa description, choisir l\'enseignant principal et ajouter ou retirer des élèves.',
            placement: 'center',
        },
        {
            target: 'body',
            content: 'Vous avez terminé le tutoriel de gestion des classes ! Vous pouvez maintenant gérer efficacement les classes de la plateforme.',
            placement: 'center',
        },
    ];

    /**
     * Réinitialise le tutoriel de gestion des classes et lance son exécution.
     * Utilise la fonction resetTutorial du contexte pour réinitialiser le tutoriel
     * identifié par 'class-management', puis met à jour l'état pour lancer le tutoriel.
     * 
     * @function
     */
    const handleResetTutorial = () => {
        resetTutorial('class-management');
        setRunTutorial(true);
    };

    /**
     * Rendu du composant avec un bouton d'aide et le tutoriel.
     * 
     * @returns {JSX.Element} Interface du tutoriel
     */
    return (
        <>
            <div className="fixed bottom-10 right-4 z-10">
                <button
                    onClick={handleResetTutorial}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
                >
                    <HelpCircle className="w-4 h-4" />
                    Aide
                </button>
            </div>

            <Tutorial
                steps={tutorialSteps}
                tutorialId="class-management"
                run={runTutorial}
                continuous={true}
                showSkipButton={true}
                onFinish={() => setRunTutorial(false)}
            />
        </>
    );
};

export default ClassManagementTutorial;