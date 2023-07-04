import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './css/navbar.css';

import { NavHashLink } from 'react-router-hash-link';
import { useLocation } from "react-router-dom";

function Markkk({ to, title, onClick }) {

  const { hash } = useLocation();
  const isActive = (iHash) => hash === iHash;

  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <NavHashLink to={to} style={isActive(to) ? { color: "var(--colour1)", fontFamily: "Helvetica Neue LT Pro UltLt", fontSize: "1.2rem", textDecoration: "none" } : {}}  onClick={handleClick}>{title}</NavHashLink>
    </>
  )
}




function Navbar() {


  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleClick = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };


  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash !== '' && isMenuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isMenuOpen]);



  let activeClassName = "active"

  return (
    <nav className='navbar grid_container_25'>
      <div className={`menuspan grid_container_25 ${isMenuOpen ? 'open' : ''}`}>
        <div className='colstart2 colend25'>

          <Markkk to="/#projects" title="Projects"  onClick={handleCloseMenu}/><br />
          <span className='hrline'></span> <br />
          <Markkk to="/#about" title="About"  onClick={handleCloseMenu}/><br />
          <span className='hrline'></span><br />
          <Markkk to="/#contact" title="Contact" onClick={handleCloseMenu}/><br />
          <span className='hrline'></span><br />
          <a className='download_cv' href='/data/cv/PranavShekhawat_CV.pdf' target="_blank">CV</a>
        </div>
      </div>

      <div className='navbar_container'>
        <div className=' nav_items nav_item_1' title='Home'>
          <NavLink style={{ color: 'var(--colour2)' }} to="/" className={({ isActive }) => isActive ? activeClassName : undefined}>
            Pranav Shekhawat
          </NavLink>
        </div>

        <div className={`nav_items navmenu ${isMenuOpen ? 'open' : ''}`} onClick={handleClick}>
          <div className='menu'>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="100px" y="100px"
              viewBox="0 0 24 8" className={isMenuOpen ? 'open' : ''}>
              <rect x="0" y="-3" width="24" height="1" />
              <rect x="0" y="3" width="24" height="1" />
            </svg>
            {/* <Markkk to="/#projects" title="Projects" /> */}

          </div>

        </div>

        <div className='nav_items nav_item_2'>
          {/* <NavLink to="/work"  id='project_link' className={({ isActive }) => isActive ? activeClassName : undefined }> */}

          {/* <a id='project_link' href='#work'  className={({ isActive }) => isActive ? activeClassName : undefined }>Work</a> */}
          <Markkk to="/#projects" title="Projects" />

          {/* </NavLink> */}

          <span className='line'></span>

          {/* <NavLink to="/activity"  id='activity_link' className={({ isActive }) => isActive ? activeClassName : undefined }>
              Activity
          </NavLink>
      
          <span className='line'></span> */}

          {/* <NavLink to="#about" id='about_link' > */}

          {/* <a id='about_link' href='#about' className={({ isActive }) => isActive ? activeClassName : undefined }>About</a> */}

          <Markkk to="/#about" title="About" />


          {/* </NavLink> */}

          <span className='line'></span>

          <Markkk to="/#contact" title="Contact" />

          <span className='line'></span>


          {/* <NavLink to='/data/cv/PranavShekhawat_CV.pdf' id='cv_link' className={({ isActive }) => isActive ? activeClassName : undefined }> */}
          <a className='download_cv' href='/data/cv/PranavShekhawat_CV.pdf' target="_blank">CV</a>
          {/* </NavLink> */}

        </div>
      </div>
    </nav>

  );
}

export default Navbar;
