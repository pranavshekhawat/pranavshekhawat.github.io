import React from 'react';
import './headingbar.css';

function Headingbar({heading, description}){
    return(
        <>

        <div className="heading_bar">
            <div className='margin_container'>
				<div className="heading_container grid_container_25">
	    	         
			        
				         <div className="heading">
				     	    {heading}
				         </div>
			        
				         <div className="heading_des">
			     		    {description}
			     	    </div>
					
				</div>
			</div>
		</div>

        
        </>
    )
}

export default Headingbar;