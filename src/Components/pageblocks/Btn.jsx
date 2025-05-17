<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';

function Btn({ content, to, targetblank }) {

    if (targetblank === true) {
        var code = <><div className='grid_container_25'>
            <div className='colstart3 colend24 text'> <Link className='btn light' to={to} target="_blank" rel='noopener noreferrer'>{content}</Link></div>
        </div></>
    }
    else {
        code = <><div className='grid_container_25'>
            <div className='colstart3 colend24 text'> <Link className='btn light' to={to}>{content}</Link></div>
        </div></>
    }
    return (code);
}

=======
import React from 'react';
import { Link } from 'react-router-dom';

function Btn({ content, to, targetblank }) {

    if (targetblank === true) {
        var code = <><div className='grid_container_25'>
            <div className='colstart3 colend24 text'> <Link className='btn light' to={to} target="_blank" rel='noopener noreferrer'>{content}</Link></div>
        </div></>
    }
    else {
        code = <><div className='grid_container_25'>
            <div className='colstart3 colend24 text'> <Link className='btn light' to={to}>{content}</Link></div>
        </div></>
    }
    return (code);
}

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Btn;