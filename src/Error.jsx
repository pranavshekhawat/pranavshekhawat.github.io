<<<<<<< HEAD
import React from 'react';
import "./css/error.css";
import Navbar from './Navbar';
import {TabTitle} from './utils/GeneralFunctions';

function Error() {
   
    TabTitle('Pranav Shekhawat - Error');


    return (
        <>
        <Navbar/>
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
        </>
    )
}

=======
import React from 'react';
import "./css/error.css";
import Navbar from './Navbar';
import {TabTitle} from './utils/GeneralFunctions';

function Error() {
   
    TabTitle('Pranav Shekhawat - Error');


    return (
        <>
        <Navbar/>
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
        </>
    )
}

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Error;