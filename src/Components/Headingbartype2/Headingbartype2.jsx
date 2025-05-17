import React from 'react';
import './headingbartype2.css';
import '../../css/index.css';

function Headingbar({heading, category, theme}){
    return(
        <>

        <div className={`heading_bar_type2 ${theme}`}>
            <div className='margin_container'>
				<div className="heading_container grid_container_25">
	    	         
			        
				         <div className={`heading_cate ${theme}`}>
			     		    <p>{category}</p>
			     	    </div>
					
				         <div className={`heading_type2 ${theme}`}>
				     	    {heading}
				         </div>
			        
				</div>
			</div>
		</div>

        
        </>
    )
}

export default Headingbar;