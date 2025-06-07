import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Composant de déconnexion qui exécute la fonction de déconnexion fournie
 * et redirige automatiquement l'utilisateur vers la page de connexion.
 *
 * @param {Object} props - Les propriétés du composant
 * @param {Function} props.onLogout - Fonction à exécuter pour déconnecter l'utilisateur
 * @returns {JSX.Element} Composant Navigate qui redirige vers la page de connexion
 * 
 * @example
 * // Dans un composant parent:
 * const handleLogout = () => {
 *   // Logique de déconnexion (effacer le token, etc.)
 *   clearAuthToken();
 * };
 * 
 * // Utilisation dans le rendu:
 * <Logout onLogout={handleLogout} />
 */
const Logout = ({ onLogout }) => {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  return <Navigate to="/sign" replace />;
};

Logout.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default Logout;
