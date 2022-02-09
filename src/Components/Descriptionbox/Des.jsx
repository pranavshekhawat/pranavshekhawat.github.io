import React from 'react';
import './des.css';

function Des({desc}) {
    return ( 
        <>
        <div className='grey grid_container_25'>
            <div className='light desc_main'>
                <div className='des_text'>
                    {desc}
                </div>
            </div>
        </div>
        </>
     );
}

export default Des;