import React, { useState } from "react";
import { Link } from 'react-router-dom';
import './css/work.css';
import { renderToStaticMarkup } from 'react-dom/server';


const Work = ({ img, title, category, description }) => {

  var str = "...Read More";
  var url = title.toLowerCase().replace(/ /g, "_");
  var cate = category.charAt(0).toUpperCase() + category.slice(1);
  // var ddd= document.getElementById('ddd').innerHTML;
  var desi = renderToStaticMarkup(description);
  var final = desi.replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/<br\/>/g, "").replace(/<\/ul>/g, "").replace(/<\/li>/g, "").replace(/<ul>/g, "").replace(/<li>/g, " • ");
  var descri = (final.charAt(0).toUpperCase() + final.slice(1)).slice(0, 150) + str;


  const [isHovering, setisHovering] = useState(false);
  function fillcolour() {
    return `arrow_right ${isHovering ? "fillcolor" : "fillwhite"} `
  }

  return (

    <Link to={`/projects/${url}`}>
      <article className="work" onMouseEnter={() => setisHovering(true)} onMouseLeave={() => setisHovering(false)}>
        <div className="work_img_div">
          <img src={img} alt='' />
        </div>

        <div className="plate">
          <p className="category">{cate}</p>
          <p className="title">{title}</p>
        </div>
        <svg className={fillcolour()} viewBox="0 0 24 24" aria-hidden="true" >
          <path d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"></path>
        </svg>
        <span id="ddd">{descri}</span>
      </article>
    </Link>
  );
};

export default Work