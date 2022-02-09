import React from 'react';
import './gallerygrid.css';

function Gallerygrid({images}) {
    return ( 
        <>
        <div className='grid_container_25 overflowhidden'>
            <div className='displayflex colstart3 colend24 '>
                 {images}
            </div>
        </div>
        </>
     );
}

export default Gallerygrid;