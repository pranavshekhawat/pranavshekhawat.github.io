import React from 'react';
import "./css/error.css";

function Error() {
    return (
        <div className='error_main'>
            <div className='error_container'>
                <div className='bd error404 '>
                    <h1>404 ERROR</h1>
                </div>
                <div>
                 <p className='roman error_des'>Woops. Looks like this page doesn't exist.</p>
                </div> 
            </div>
        </div>
    )
}

export default Error;