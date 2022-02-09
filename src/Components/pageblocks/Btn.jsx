import React from 'react';
import {Link} from 'react-router-dom';

function Btn({content, to, targetblank}) {
   
    if(targetblank===true){
        var code=<><Link className='btn light' to={to} target="_blank" rel='noopener noreferrer'>{content}</Link></>
    }
    else{
        code=<><Link className='btn light' to={to}>{content}</Link></> 
    }
    return ( code );
}

export default Btn;