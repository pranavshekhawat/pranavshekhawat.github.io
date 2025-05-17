<<<<<<< HEAD
import React from 'react';
import './gallerygrid.css';


function Img({src, alt, expandable, height}) {
  
    if(expandable===true){

        // Here i will make a modal and show the image for that i'll need ""usecontext"".  
       var output= <><div className="grid_div" style={{height:height}}><img className='grid_img' src={process.env.PUBLIC_URL+src} alt={alt}></img></div>
       
       </>
    }
    else{
        output= <> <div className="grid_div" style={{height:height}}><img className='grid_img' src={process.env.PUBLIC_URL+src} alt={alt}></img></div></>
    }
  
    return ( 
        <>
        {output}
        </>
     );
}


=======
import React from 'react';
import './gallerygrid.css';


function Img({src, alt, expandable, height}) {
  
    if(expandable===true){

        // Here i will make a modal and show the image for that i'll need ""usecontext"".  
       var output= <><div className="grid_div" style={{height:height}}><img className='grid_img' src={process.env.PUBLIC_URL+src} alt={alt}></img></div>
       
       </>
    }
    else{
        output= <> <div className="grid_div" style={{height:height}}><img className='grid_img' src={process.env.PUBLIC_URL+src} alt={alt}></img></div></>
    }
  
    return ( 
        <>
        {output}
        </>
     );
}


>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Img;