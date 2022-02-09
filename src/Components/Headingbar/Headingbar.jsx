import React from 'react';
import './headingbar.css';

function Headingbar({heading, description}){
    return(
        <>

        <div class="heading_bar">
            <div className='margin_container'>
				<div className="heading_container grid_container_25">
	    	         
			        
				         <div class="heading">
				     	    <h1>{heading}</h1>
				         </div>
			        
				         <div class="heading_des">
			     		    {description}
			     	    </div>
					
				</div>
			</div>
		</div>

        
        </>
    )
}

export default Headingbar;