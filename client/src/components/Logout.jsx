import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

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
