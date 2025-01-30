import React, { useState } from 'react';
import { Navbar, Nav, Button, Collapse } from 'react-bootstrap';

const VerticalNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="d-flex">
      {/* Vertical Navbar */}
      <div>
        <Button
          onClick={() => setOpen(!open)}
          aria-controls="example-collapse-text"
          aria-expanded={open}
          className="mb-3"
        >
          Toggle Menu
        </Button>x
        <Collapse in={open}>
          <div id="example-collapse-text" className="bg-light border p-3" style={{ width: '200px' }}>
            <Nav className="flex-column">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#about">About</Nav.Link>
              <Nav.Link href="#services">Services</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
            </Nav>
          </div>
        </Collapse>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3">
        <h1>Main Content</h1>
        <p>This is where the main content of the page would go.</p>
      </div>
    </div>
  );
};

export default VerticalNavbar;
