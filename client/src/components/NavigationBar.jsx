import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  AlignJustify,
  House,
  LibraryBig,
  UserRoundCog,
  Radio,
} from 'lucide-react';
import './style/NavigationBar.css';

const NavigationBar = ({ page }) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = React.useState(true);

  const handleNavigate = path => e => {
    e.preventDefault();
    navigate(path);
  };

  const navItems = [
    { name: 'Lives', path: '/lives', icon: <Radio /> },
    { name: 'Courses', path: '/courses-library', icon: <LibraryBig /> },
    { name: 'Profile', path: '/profile', icon: <UserRoundCog /> },
  ];

  return (
    <nav className="navbar NavigationBar-container">
      <button
        className="btn btn-outline-secondary mb-3"
        id="toggle"
        onClick={() => setIsActive(!isActive)}
      >
        <AlignJustify />
      </button>

      {isActive && (
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={handleNavigate('/')}>
              <House />
            </a>
          </li>
          {navItems
            .filter(item => item.name !== page)
            .map(item => (
              <li className="nav-item" key={item.name}>
                <a
                  className="nav-link"
                  href="#"
                  onClick={handleNavigate(item.path)}
                >
                  {item.icon}
                </a>
              </li>
            ))}
        </ul>
      )}
    </nav>
  );
};

NavigationBar.propTypes = {
  page: PropTypes.string.isRequired,
};

export default NavigationBar;
