import React from 'react';
import './des.css';

function Des({desc}) {
    return ( 
        <>
        <div className='grey grid_container_25'>
            <span id='overview' className="bookmark_positioner_2" ></span>
            <div className=' desc_main'>
                <div className='des_text'>
                    {desc}
                </div>
            </div>
        </div>
        </>
     );
}

export default Des;