import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/mba_logo.png';

const Navbar = () => {
  return (
    <div className='navbar-container'>
      <div className='logo-container'>
        <a href="/"><img src={logo} alt="Logo" className="logo" /> </a>
      </div>
      <nav className="navbar">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Exit Multiple</NavLink>
        <NavLink to="/dcf" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>DCF</NavLink>
        <NavLink to="/is-it-cheap" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Is it Cheap</NavLink>
      </nav>

    </div>
  );
};

export default Navbar;
