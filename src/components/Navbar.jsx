import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Exit Multiple</NavLink>
      <NavLink to="/dcf" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>DCF</NavLink>
      <NavLink to="/is-it-cheap" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Is it Cheap</NavLink>
    </nav>
  );
};

export default Navbar;
