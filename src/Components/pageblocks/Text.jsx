import React from 'react';

function Text(props) {
    const {content}=props;
    return ( <>
    <div className='grid_container_25'>
    <div className='colstart3 colend24 text'> 
    {content}
    </div>
    </div>
    </> );
    // the css for class text is in index.css
}

export default Text;