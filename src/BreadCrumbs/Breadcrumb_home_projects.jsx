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
       <li> <span onClick={() => {navigate("/");}} className="link1" to="/home">
          Home
        </span></li>

        <li><span onClick={() => {navigate("/works");}} className="link2" to="/works">
          Works
        </span></li>
        
        <li className="currentcrumb">
         {text}
        </li>
        </ul>
        </div>
      </div>
    </div>
  );
}

export default BasicBreadcrumbs;