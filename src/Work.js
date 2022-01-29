import React from "react";
import {Link} from 'react-router-dom';

const Work = ({ img, title }) => {

    var url=title.toLowerCase().replace(" ","_");

    return (
        
<article className="work">
<img src={img} alt='' />
<h1>{title}</h1>
<Link to={`/projects/${url}`}>view full page</Link>
</article>
    );
};

export default Work