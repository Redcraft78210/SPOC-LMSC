import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ width: "300px", height: "2000px" }}>
      <Link className="navbar-brand" to="/">SPOC</Link>
      <button 
        className="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <div className="navbar-square-first bg-light"></div>
        <div className="navbar-square-second"></div>
        <div className="n_simple container-fluid">
          <div className="links-container n_links-container">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="n_link-button nav-link d-block text-center bg-white text-primary text-decoration-none rounded-circle fw-bold" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="n_link-button nav-link d-block text-center bg-white text-primary text-decoration-none rounded-circle fw-bold" to="/courses">Courses</Link>
              </li>
              <li className="nav-item">
                <a href="#" className="n_link-button link-button d-block text-center bg-white text-primary text-decoration-none rounded-circle fw-bold">Contact</a>
              </li>
              <li className="nav-item">
                <Link className="n_link-button nav-link d-block text-center bg-white text-primary text-decoration-none rounded-circle fw-bold" to="/profile">Profile</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="navbar-square-last">
          <div className="navbar-square-third bg-light"></div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
