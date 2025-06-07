/**
 * @fileoverview
 * Composant qui gère l'affichage du tutoriel du tableau de bord.
 * Ce tutoriel s'adapte au rôle de l'utilisateur (Etudiant, Professeur, Administrateur)
 * et présente les fonctionnalités spécifiques à chaque rôle.
 */

import { useState, useEffect } from 'react';
import Tutorial from '../components/Tutorial';
import { useTutorial } from '../contexts/TutorialContext';
import PropTypes from 'prop-types';

/**
 * Composant qui affiche un tutoriel guidé pour le tableau de bord
 * adapté au rôle de l'utilisateur.
 * 
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.userRole - Le rôle de l'utilisateur ('Etudiant', 'Professeur', 'Administrateur')
 * @param {string} props.name - Le nom de l'utilisateur à afficher dans le message de bienvenue
 * @returns {JSX.Element} Composant de tutoriel pour le tableau de bord
 */
const DashboardTutorial = ({ userRole, name }) => {
  /**
   * État contrôlant si le tutoriel est en cours d'exécution
   * @type {boolean}
   * @type {Function}
   * @description
   * Cet état est initialisé à false et sera mis à true si l'utilisateur
   * n'a pas encore complété le tutoriel pour son rôle spécifique.
   * Il est utilisé pour déclencher l'affichage du tutoriel.
   * @default false
   */
  const [runTutorial, setRunTutorial] = useState(false);
  
  /**
   * Contexte fournissant les fonctions de gestion des tutoriels
   * @type {Object}
   */
  const { isTutorialCompleted, completeTutorial } = useTutorial();
  
  /**
   * Identifiant unique pour ce tutoriel, généré à partir du rôle de l'utilisateur
   * @type {string}
   */
  const tutorialId = `dashboard-${userRole.toLowerCase()}`;
  
  /**
   * Effet qui lance automatiquement le tutoriel si l'utilisateur
   * ne l'a pas encore complété
   */
  useEffect(() => {
    if (!isTutorialCompleted(tutorialId)) {
      setRunTutorial(true);
    }
  }, [isTutorialCompleted, tutorialId]);
  
  /**
   * Génère les étapes du tutoriel en fonction du rôle de l'utilisateur
   * 
   * @returns {Array<Object>} Tableau d'objets représentant les étapes du tutoriel
   * Chaque étape contient:
   * - target: Le sélecteur CSS de l'élément cible
   * - content: Le texte explicatif à afficher
   * - placement: La position où afficher le tooltip (center, right, bottom, etc.)
   * - disableBeacon: Option pour désactiver le point de repère (si true)
   */
  const getStepsForRole = () => {
    /**
     * Étapes communes à tous les rôles d'utilisateurs
     * @type {Array<Object>}
     */
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