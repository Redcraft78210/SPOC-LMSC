import React from 'react';
import {
  Home,
  LibraryBig,
  BookOpen,
  Settings,
  User,
  Users,
  FileVideo2,
  MessagesSquare,
  Tv,
  FileSearch,
  Video,
  NotepadText,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Navigation bar component that displays different navigation items based on user role.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.isAdmin=false] - Flag indicating if the user has admin privileges
 * @param {boolean} [props.isProf=false] - Flag indicating if the user has professor privileges
 * @returns {JSX.Element} Rendered navigation bar component
 * 
 * @example
 * // For a standard user
 * <NavigationBar />
 * 
 * @example
 * // For an admin user
 * <NavigationBar isAdmin={true} />
 * 
 * @example
 * // For a professor
 * <NavigationBar isProf={true} />
 */
const NavigationBar = ({ isAdmin = false, isProf = false }) => {
  /**
   * Hook for programmatic navigation
   * @type {function}
   */
  const navigate = useNavigate();
  
  /**
   * Hook to access the current location
   * @type {Object}
   */
  const location = useLocation();
  
  /**
   * State to track the currently active route
   * @type {string}
   */
  const [activeRoute, setActiveRoute] = React.useState(location.pathname);

  /**
   * Effect hook to update the active route when location changes
   */
  React.useEffect(() => {
    const currentPath = location.pathname;
    setActiveRoute(currentPath);
  }, [location.pathname]);

  /**
   * Navigation items configuration based on user role
   * @type {Array<Object>}
   */
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
    { icon: Tv, path: '/liveViewer', label: 'Live', clickable: false },
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
          path: '/video-manager',
          label: 'Gestion des vidéos',
        },
        {
          icon: FileSearch,
          path: '/document-manager',
          label: 'Gestion des documents de cours',
        },
        {
          icon: NotepadText,
          path: '/courses-managment',
          label: 'Gestion des cours',
        },
        {
          icon: Video,
          path: '/video-recording',
          label: 'Enregistrement vidéo',
        },
      ]
      : []),

    { icon: Settings, path: '/settings', label: 'Paramètres', className: 'settings' },
  ];

  /**
   * Handles navigation to the specified path
   * 
   * @param {string} path - The route path to navigate to
   */
  const handleNavigation = path => {
    navigate(path);
  };

  return (
    <div className="h-full w-16 flex flex-col items-center justify-center bg-gray-800 text-white py-4 space-y-7">
      {navItems.map((item, index) => (
        <button
          key={index}
          {...(item.clickable !== false && {
            onClick: () => handleNavigation(item.path),
          })}
          className={`${item.className || ''} p-2 rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 ${
            activeRoute.toLowerCase() === item.path.toLowerCase()
              ? 'bg-white text-gray-800'
              : ''
          }`}
          aria-label={item.label}
        >
          <item.icon className="h-6 w-6" />
        </button>
      ))}
    </div>
  );
};

NavigationBar.propTypes = {
  isAdmin: PropTypes.bool,
  isProf: PropTypes.bool,
};

export default NavigationBar;
