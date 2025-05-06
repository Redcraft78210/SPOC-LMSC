import React from 'react';
import {
  Home,
  LibraryBig,
  BookOpen,
  Settings,
  Sun,
  User,
  Users,
  FileVideo2,
  MessagesSquare,
  Tv,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavigationBar = ({ isAdmin = false, isProf = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = React.useState(location.pathname);

  React.useEffect(() => {
    // Ignore query parameters when setting the active route
    const currentPath = location.pathname;
    console.log(currentPath);
    setActiveRoute(currentPath);
  }, [location.pathname]);

  const navItems = [
    { icon: Home, path: '/dashboard', label: 'Home' },
    { icon: LibraryBig, path: '/courses-library', label: 'Cours' },
    {
      icon: BookOpen,
      path: '/course-reader',
      label: 'Reader',
      clickable: false,
    },
    {
      icon: MessagesSquare,
      path: '/forum',
      label: 'Forum',
    },
    { icon: Tv, path: '/liveViewer', label: 'Live' },
    ...(isAdmin
      ? [
          {
            icon: User,
            path: '/Users-Management',
            label: 'Gestion des utilisateurs',
          },
          {
            icon: Users,
            path: '/Classes-Management',
            label: 'Gestion des classes',
          },
        ]
      : []),
    ...(isProf
      ? [
          {
            icon: FileVideo2,
            path: 'Video-Manager',
            label: 'Gestion des vidéos',
          },
        ]
      : []),
    { icon: Sun, path: '/theme-settings', label: 'Thème' },
    { icon: Settings, path: '/settings', label: 'Paramètres' },
  ];

  const handleNavigation = path => {
    navigate(path);
  };

  return (
    <aside className="h-full w-16 flex flex-col items-center justify-center bg-gray-800 text-white py-4 space-y-7">
      {navItems.map((item, index) => (
        <button
          key={index}
          {...(item.clickable !== false && {
            onClick: () => handleNavigation(item.path),
          })}
          className={`p-2 rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 ${
            activeRoute.toLowerCase() === item.path.toLowerCase()
              ? 'bg-white text-gray-800'
              : ''
          }`}
          aria-label={item.label}
        >
          <item.icon className="h-6 w-6" />
        </button>
      ))}
    </aside>
  );
};

NavigationBar.propTypes = {
  isAdmin: PropTypes.bool,
  isProf: PropTypes.bool,
};

export default NavigationBar;
