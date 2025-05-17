<<<<<<< HEAD
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

=======
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

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Imgbottom;