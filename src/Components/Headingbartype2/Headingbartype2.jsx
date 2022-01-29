import React from 'react';
import './headingbartype2.css';
import '../../css/index.css';

function Headingbar({heading, category, theme}){
    return(
        <>

        <div class={`heading_bar_type2 ${theme}`}>
            <div className='margin_container'>
				<div className="heading_container grid_container_25">
	    	         
			        
				         <div class={`heading_cate ${theme}`}>
			     		    <p>{category}</p>
			     	    </div>
					
				         <div class={`heading_type2 ${theme}`}>
				     	    <h1>{heading}</h1>
				         </div>
			        
				</div>
			</div>
		</div>

        
        </>
    )
}

export default Headingbar;