import React from "react";
import {Link} from 'react-router-dom';
 
const Work = ({ img, title, category, description }) => {

    var url=title.toLowerCase().replace(" ","_");
    var cate=category.charAt(0).toUpperCase() + category.slice(1);
    var descri= (description.charAt(0).toUpperCase() + description.slice(1)).slice(0, 100) + '...';
    

    return (
        
    <Link to={`/works/${url}`}>
      <article className="work">
        <div className="work_img_div">
        <img src={img} alt='' />
        </div>

        <div className="plate">
          <p className="title">{title}</p>
          <p className="category">{cate}</p>
        </div>
        <br/>
        <p>{descri}</p>
      </article>
    </Link>
    );
};

export default Work