import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const Logout = ({ onLogout }) => {
  useEffect(() => {
    onLogout(); // Call the logout function when this component mounts.
  }, [onLogout]);

  return <Navigate to="/sign" replace />; // Redirect to login page after logging out.
};

Logout.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default Logout;
