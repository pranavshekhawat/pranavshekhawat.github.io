import React from 'react';
// import {Link} from 'react-router-dom';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home';
import Work from './Work.js';
import {data} from './works.js';
import Headingbar from './Components/Headingbar/Headingbar';


function Works(){
    return (
      <section className="worklist">
      {data.map((list)=>{
        return <Work key={list.id} {...list}></Work>
      })}
      </section>
    );
  }

function Projects(){
   
    return(
        <>
        <BasicBreadcrumbs text="Projects" theme="dark"></BasicBreadcrumbs>
        <Headingbar heading="Projects" description="Here are my few selected projects that show my woking process" />
        
        <Works />
        </>
        
    )
}

export default Projects;