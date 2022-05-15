import React from 'react';
// import {Link} from 'react-router-dom';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home';
import Work from './Work.jsx';
import {data} from './works.js';
import Headingbar from './Components/Headingbar/Headingbar';
import Navbar from './Navbar';
import { TabTitle } from './utils/GeneralFunctions';
import ReactGA from 'react-ga';

  const TRACKING_ID = "G-Z18T1FYYYD"; // OUR_TRACKING_ID
  ReactGA.initialize(TRACKING_ID);

var number=ReactGA.pageview();


function Works(){
    return (
      <div className='grid_container_25'>
        <div className='colstart2 colend25'>
          <div>{number}</div>
      <section className="worklist">
      {data.map((list)=>{
        return <Work key={list.id} {...list}></Work>
      })}
      </section>
      </div>
      </div>
    );
  }

function Projects(){

  TabTitle('Pranav Shekhawat - Works');
  
    return(
        <>
        <Navbar/>
        <BasicBreadcrumbs text="Works" theme="dark"></BasicBreadcrumbs>
        <Headingbar heading="Works" description="" />
        {/* Here are my few selected projects that show my woking process */}
        <Works />
        </>
        
    )
}

export {Works};
export default Projects;

