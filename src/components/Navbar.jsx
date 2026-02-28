import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/mba_logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hook to block body scroll when the menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }

    // Cleanup function to ensure the class is removed when the component unmounts
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [isMenuOpen]); // Dependency array ensures this runs only when isMenuOpen changes

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Cierra el menú cuando se hace clic en un enlace
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className='navbar-container'>
      <div className='logo-container'>
        <a href="/"><img src={logo} alt="Logo" className="logo" /></a>
      </div>

      {/* Botón del Menú de Hamburguesa */}
      <button 
        className={isMenuOpen ? "burger-menu active" : "burger-menu"} 
        onClick={toggleMenu} 
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Enlaces de Navegación */}
      <nav className={isMenuOpen ? 'navbar active' : 'navbar'}>
        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Exit Multiple</NavLink>
        <NavLink to="/dcf" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>DCF</NavLink>
        <NavLink to="/is-it-cheap" onClick={closeMenu} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Is it Cheap</NavLink>
      </nav>

    </div>
  );
};

export default Navbar;
