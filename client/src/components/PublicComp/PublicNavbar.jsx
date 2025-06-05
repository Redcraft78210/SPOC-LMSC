import { useNavigate } from 'react-router-dom';
import Logo from '../../Logo';

const PublicNavbar = () => {
  const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const handleLogout = () => {
    window.location.href = '/logout';
  };

  const navigate = useNavigate();
  const isAuthenticated = !!authToken;

  const navItems = [
    { href: '/courses-library', label: 'Cours' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ];

  const signButtons = [
    {
      href: '/sign',
      label: 'Connexion',
      className: 'bg-blue-600 text-white',
    },
    {
      href: '/sign?register=true',
      label: 'Inscription',
      className: 'border-2 border-blue-600 text-blue-600',
    },
  ];

  const authenticatedButtons = [
    {
      href: '/dashboard',
      label: 'Tableau de bord',
      className: 'bg-blue-600 text-white',
    },
    {
      onClick: handleLogout,
      label: 'Déconnexion',
      className: 'border border-blue-600 text-blue-600',
    },
  ];

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                navigate('/');
              }}
            >
              <Logo
                className="h-20 w-auto"
                fillColor={'#1555ec'}
                alt="SPOC Logo"
              />
            </a>
            <div className="hidden md:flex space-x-8 ml-10">
              {navItems.map(link => (
                <a
                  key={link.href}
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    navigate(link.href);
                  }}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {authenticatedButtons.map(
                  ({ href, onClick, label, className }) => (
                    <a
                      key={label}
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (href) navigate(href);
                        if (onClick) onClick();
                      }}
                      className={`${className} px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors`}
                    >
                      {label}
                    </a>
                  )
                )}
              </>
            ) : (
              <>
                {signButtons.map(({ href, label, className }) => (
                  <a
                    key={label}
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      navigate(href);
                    }}
                    className={`${className} px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors`}
                  >
                    {label}
                  </a>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
