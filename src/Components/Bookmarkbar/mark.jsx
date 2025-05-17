<<<<<<< HEAD
import React from "react";
import { NavHashLink } from 'react-router-hash-link';
import { useLocation } from "react-router-dom";


function Mark({to, title}){

    const { hash } = useLocation();
    const isActive = (iHash) => hash === iHash;
  
return(
    <>
    <NavHashLink to={to}  style={ isActive(to) ? {color: "var(--colour3)", padding: "18px 0px 15px 0px", borderBottom: "3.5px solid var(--colour3)", fontFamily: "Helvetica Neue LT Pro Bd", fontSize: "1rem", textDecoration:"none"}: {}} >{title}</NavHashLink>
    </>
)
}

=======
import React from "react";
import { NavHashLink } from 'react-router-hash-link';
import { useLocation } from "react-router-dom";


function Mark({to, title}){

    const { hash } = useLocation();
    const isActive = (iHash) => hash === iHash;
  
return(
    <>
    <NavHashLink to={to}  style={ isActive(to) ? {color: "var(--colour3)", padding: "18px 0px 15px 0px", borderBottom: "3.5px solid var(--colour3)", fontFamily: "Helvetica Neue LT Pro Bd", fontSize: "1rem", textDecoration:"none"}: {}} >{title}</NavHashLink>
    </>
)
}

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Mark;