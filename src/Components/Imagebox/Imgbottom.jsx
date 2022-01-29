import React from 'react';
import './img.css';

function Imgbottom({src, alt}) {

    return(
        <>
        <div className='imagebottom_box'>
            <img className='imagebottom' src={process.env.PUBLIC_URL+src} alt={alt} />
        </div>
        </>
    )
    
}

export default Imgbottom;