import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import DashboardAdmin from '../pages/Admin/Dashboard';
import DashboardEleve from '../pages/Eleve/Dashboard';
import DashboardProf from '../pages/Professeur/Dashboard';

import Logout from './Logout';
import NotFound from '../pages/Public/NotFound';

const routeConfig = [
  { path: '/dashboard', content: 'Home' },
  { path: '/profile', content: 'Profile' },
  { path: '/courses-library', content: 'CoursesLibrary' },
  { path: '/video-manager', content: 'VideoManager' },
  { path: '/course-reader', content: 'CourseReader' },
  { path: '/users-management', content: 'UserManagement' },
  { path: '/classes-management', content: 'ClassManagement' },
  { path: '/theme-settings', content: 'ThemeSettings' },
  { path: '/settings', content: 'Settings' },
];

function AuthenticatedRoutes({ auth, role, handleLogout }) {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || (auth && auth.exp * 1000 < Date.now())) {
      handleLogout();
    }
  }, [auth]);

  console.log('rer');
  let DashboardComponent;
  switch (role) {
    case 'Professeur':
      DashboardComponent = DashboardProf;
      break;
    case 'Administrateur':
      DashboardComponent = DashboardAdmin;
      break;
    default:
      DashboardComponent = DashboardEleve;
  }

  return (
    <Routes>
      {routeConfig.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <DashboardComponent
              content={route.content}
              token={localStorage.getItem('authToken')}
            />
          }
        />
      ))}
      <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

AuthenticatedRoutes.propTypes = {
  auth: PropTypes.shape({
    exp: PropTypes.number.isRequired,
  }).isRequired,
  role: PropTypes.oneOf(['Professeur', 'Administrateur', 'Eleve']).isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default AuthenticatedRoutes;
