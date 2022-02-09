import React, { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import {data} from './works.js';
import Projects from './Projects.jsx';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home_projects'
import Headingbartype2 from './Components/Headingbartype2/Headingbartype2';
import Imagetop from './Components/Imagebox/Imgtop';
import Imagebottom from './Components/Imagebox/Imgbottom';

import Bookmarkbar from "./Components/Bookmarkbar/Bookmarkbar";
import Des from "./Components/Descriptionbox/Des";


function Workpage(){
   
const {url}= useParams();
const [list , setList] = useState(null)


useEffect(()=>{
 let list=data.find((list)=> list.title.toLowerCase().replace(" ","_") === (url))
 if(list){
    
     setList(list);
 }
}, [url] );

    return(
        <>
        
        
        { list ? (
            
            <div classname="blog-wrap">
            <BasicBreadcrumbs text={list.title} theme="light"></BasicBreadcrumbs>
            <Headingbartype2 heading={list.title} theme="light" category={list.category}></Headingbartype2>
           
            <Bookmarkbar bookmarks={list.bookmarks}/>   
            <Imagetop src={list.topimg}></Imagetop>
            <Des desc={list.description}/>
                   
            <section className="grey">
                    {list.body}
            </section>
                
            <Imagebottom src={list.bottomimg}></Imagebottom>
                </div>

             ): <Projects/> }
       </>
    );
};

export default Workpage;