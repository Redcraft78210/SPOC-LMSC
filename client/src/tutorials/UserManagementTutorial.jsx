import { useState } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import Tutorial from '../components/Tutorial';
import { HelpCircle } from 'lucide-react';

const UserManagementTutorial = () => {
    const [runTutorial, setRunTutorial] = useState(false);
    const { resetTutorial } = useTutorial();


    const tutorialSteps = [
        {
            target: 'body',
            content: 'Bienvenue dans la gestion des utilisateurs. Ce tutoriel vous guidera à travers les différentes fonctionnalités disponibles.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.container h1',
            content: 'Vous êtes dans la section Gestion des Utilisateurs où vous pouvez créer, modifier et gérer tous les utilisateurs de la plateforme.',
            placement: 'bottom',
        },
        {
            target: 'button:has(.lucide-user-plus)',
            content: 'Cliquez ici pour créer un nouvel utilisateur. Vous pourrez définir son nom, prénom, email, rôle et mot de passe.',
            placement: 'bottom',
        },
        {
            target: 'button:has(.lucide-key-round)',
            content: 'Gérez les codes d\'invitation qui permettent aux utilisateurs de s\'inscrire avec un rôle prédéfini. Vous pouvez définir le nombre d\'utilisations et la durée de validité.',
            placement: 'bottom',
        },
        {
            target: '.searchuser',
            content: 'Utilisez la barre de recherche pour trouver rapidement un utilisateur par son nom, email ou autre attribut.',
            placement: 'bottom',
        },
        {
            target: '.toggleView',
            content: 'Basculez entre les vues liste et grille selon vos préférences. La liste offre plus de détails, tandis que la grille est plus compacte.',
            placement: 'bottom',
        },
        {
            target: 'table thead tr th:first-child, .grid.grid-cols-1 > div:first-child input[type="checkbox"]',
            content: 'Sélectionnez plusieurs utilisateurs pour effectuer des actions groupées comme la suppression ou l\'activation/désactivation.',
            placement: 'right',
        },
        {
            target: '.bg-blue-50',
            content: 'Lorsque des utilisateurs sont sélectionnés, cette barre apparaît et vous permet d\'effectuer des actions groupées.',
            placement: 'bottom',
            isVisible: () => document.querySelector('.bg-blue-50') !== null,
        },
        {
            target: 'table tbody tr:first-child td:last-child, .grid.grid-cols-1 > div:first-child .flex.gap-2',
            content: 'Pour chaque utilisateur, vous pouvez : modifier ses informations, activer/désactiver son compte, le supprimer, ou changer son rôle.',
            placement: 'left',
        },
        {
            target: 'button:has(.lucide-edit)',
            content: 'Modifiez les informations d\'un utilisateur existant comme son nom, email ou mot de passe.',
            placement: 'top',
        },
        {
            target: 'button:has(.lucide-ban), button:has(.lucide-check)',
            content: 'Activez ou désactivez l\'accès d\'un utilisateur à la plateforme sans supprimer son compte.',
            placement: 'top',
        },
        {
            target: 'button:has(.lucide-trash-2)',
            content: 'Supprimez définitivement un compte utilisateur (action irréversible).',
            placement: 'top',
        },
        {
            target: '.lucide-user-check, .lucide-user-minus',
            content: 'Promouvez ou rétrogradez un utilisateur pour changer son niveau d\'accès (Étudiant, Professeur, Administrateur).',
            placement: 'top',
        },
        {
            target: 'body',
            content: 'Vous avez terminé le tutoriel de gestion des utilisateurs ! Vous pouvez maintenant gérer efficacement les comptes utilisateurs de la plateforme.',
            placement: 'center',
        },
    ];

    const handleResetTutorial = () => {
        resetTutorial('user-management');
        setRunTutorial(true);
    };

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
                tutorialId="user-management"
                run={runTutorial}
                continuous={true}
                showSkipButton={true}
                onFinish={() => setRunTutorial(false)}
            />
        </>
    );
};

export default UserManagementTutorial;