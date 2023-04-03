import React from 'react';
import {NavLink} from 'react-router-dom';
import './css/navbar.css';

import { NavHashLink } from 'react-router-hash-link';
import { useLocation } from "react-router-dom";

function Markkk({to, title}){

  const { hash } = useLocation();
  const isActive = (iHash) => hash === iHash;

return(
  <>
  <NavHashLink to={to}  style={ isActive(to) ? {color: "var(--colour1)", fontFamily: "Helvetica Neue LT Pro UltLt", fontSize: "1.2rem", textDecoration:"none"}: {}} >{title}</NavHashLink>
  </>
)
}

function Navbar() {
  
    let activeClassName = "active"
  
    return (
    <nav className='navbar grid_container_25'>
      <div className='navbar_container'>
        <div className=' nav_items nav_item_1' title='Home'>
          <NavLink style={{color:'var(--colour2)'}} to="/" className={({ isActive }) => isActive ? activeClassName : undefined }>
              Pranav Shekhawat
          </NavLink>
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
