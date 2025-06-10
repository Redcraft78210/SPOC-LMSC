/**
 * @fileoverview
 * Une page d'erreur 404 qui s'affiche lorsqu'un utilisateur navigue vers une route inexistante.
 * Fournit un bouton pour naviguer vers une page d'accueil appropriée basée sur le statut d'authentification.
 * 
 * @component
 * @returns {JSX.Element} Une page 404 avec bouton de navigation
 */
import { useNavigate } from 'react-router-dom';

function NotFound() {
  /**
   * Récupère le token d'authentification depuis le stockage du navigateur
   * Vérifie d'abord sessionStorage, puis se rabat sur localStorage
   * 
   * @type {string|null}
   */
  const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  
  /**
   * Fonction de navigation de react-router-dom
   * 
   * @type {Function}
   */
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">404 - Page Non Trouvée</h1>
      <p className="text-lg mb-6">
        Désolé, la page que vous recherchez n&apos;existe pas.
      </p>
      <button
        onClick={() => navigate(authToken ? '/dashboard' : '/')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Retourner à la page d&apos;accueil
      </button>
    </div>
  );
}

export default NotFound;
