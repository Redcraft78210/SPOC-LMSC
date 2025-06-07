/**
 * @fileoverview Point d'entrée principal de l'application React.
 * Ce fichier initialise l'application en rendant le composant racine dans le DOM.
 * Il configure également le ThemeProvider pour gérer les thèmes de l'application.
 * 
 */

import ReactDOM from 'react-dom/client';
import './index.css';

import { ThemeProvider } from './contexts/ThemeProvider.jsx';
import App from './App.jsx';

/**
 * @type {Object}
 * @description Instance de rendu React pour l'application
 */
let root;

/**
 * @type {Object}
 * @description Fonction pour monter l'application React dans le DOM
 */
const mountApp = () => {
  /**
   * @type {Object}
   * @description Crée une racine React sur l'élément DOM avec l'id 'root'.
   */
  root = ReactDOM.createRoot(document.getElementById('root'));

  /**
   * Rend l'application React dans l'élément DOM racine.
   * Encapsule le composant App dans ThemeProvider pour fournir
   * un contexte de thème à toute l'application.
   */
  root.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

// Monter l'application
mountApp();
