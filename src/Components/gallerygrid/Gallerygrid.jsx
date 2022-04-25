import React from 'react';
import './gallerygrid.css';

function Gallerygrid({images}) {
    return ( 
        <>
        <div className='overflowhidden'>
            <div className='displayflex'>
                 {images}
            </div>
        </div>
        </>
     );
}

export default Gallerygrid;