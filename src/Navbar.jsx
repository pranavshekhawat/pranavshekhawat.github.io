import React from 'react';
import {NavLink} from 'react-router-dom';
import './css/navbar.css';

function Navbar() {
  
    let activeClassName = "active"
  
    return (
    <nav className='navbar grid_container_25'>
      <div className='navbar_container'>
        <div className=' nav_items nav_item_1' title='Home'>
          <NavLink style={{color:'#f6f6f6'}} to="/" className={({ isActive }) => isActive ? activeClassName : undefined }>
              Pranav Shekhawat
          </NavLink>
        </div> 
        <div className='nav_items nav_item_2'>
          <NavLink to="/works"  id='project_link' className={({ isActive }) => isActive ? activeClassName : undefined }>
              Works
          </NavLink>
      
          <span className='line'></span>

          <NavLink to="/activity"  id='activity_link' className={({ isActive }) => isActive ? activeClassName : undefined }>
              Activity
          </NavLink>
      
          <span className='line'></span>

          <NavLink to="/about" id='about_link' className={({ isActive }) => isActive ? activeClassName : undefined }>
              About
          </NavLink>
           
        </div>
      </div> 
    </nav>
      
    );
  }

export default Navbar;
