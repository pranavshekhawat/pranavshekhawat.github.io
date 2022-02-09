import React from 'react';
import { useNavigate } from "react-router-dom";
import Contact from './Contact';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home';
import Headingbar from './Components/Headingbar/Headingbar';

function About(){
    let navigate = useNavigate();
    return(
        <>
         <BasicBreadcrumbs text="About" theme="dark"></BasicBreadcrumbs>
        <Headingbar heading="About"></Headingbar>
        <p>this is about page</p>
        <button onClick={() => {navigate("/projects");}}>Go to projects</button>
        <Contact/>
        </>
    )
}

export default About;