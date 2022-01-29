import React from 'react';
import './img.css';

function Imgtop({src, alt}) {

    return(
        <>
        <div className='imagetop_box'>
            <img className='imagetop' src={process.env.PUBLIC_URL+src} alt={alt} />
        </div>
        </>
    )
    
}

export default Imgtop;