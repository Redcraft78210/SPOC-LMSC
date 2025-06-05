import { useNavigate } from 'react-router-dom';
import Logo from '../../Logo';
import { useState } from 'react';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
              className="flex-shrink-0"
            >
              <Logo
                className="h-16 w-auto sm:h-20"
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
          
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
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
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* X icon */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map(link => (
            <a
              key={link.href}
              href="#"
              onClick={e => {
                e.preventDefault();
                navigate(link.href);
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5 space-y-3 flex-col">
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
                        setMobileMenuOpen(false);
                      }}
                      className={`${className} w-full text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors`}
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
                      setMobileMenuOpen(false);
                    }}
                    className={`${className} w-full text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors`}
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
