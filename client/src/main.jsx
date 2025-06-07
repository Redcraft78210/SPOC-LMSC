/**
 * @fileoverview Point d'entrée principal de l'application React.
 * Ce fichier initialise l'application en rendant le composant racine dans le DOM.
 * Il configure également le ThemeProvider pour gérer les thèmes de l'application.
 * 
 * @module main
 */

import ReactDOM from 'react-dom/client';
import './index.css';

import { ThemeProvider } from './contexts/ThemeProvider.jsx';
import App from './App.jsx';

/**
 * Crée une racine React sur l'élément DOM avec l'id 'root'.
 * @type {import('react-dom/client').Root}
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

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
