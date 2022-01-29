import React from 'react';
import '../css/breadcrumb.css';
import { useNavigate } from "react-router-dom";
import '../css/index.css';

function BasicBreadcrumbs({text, theme}) {

  let navigate = useNavigate();
  return (
    
    <div className={`breadcrumb ${theme}`}>
      <div className="breadmain">
        <div className={`breaditem ${theme}`}>
          <ul>
          <li>
        <span onClick={() => {navigate("/");}} className="link1">
          Home
        </span></li>
        
        <li>
          {text}
        </li>
        </ul>
        </div>
      </div>
    </div>
  );
}

export default BasicBreadcrumbs;