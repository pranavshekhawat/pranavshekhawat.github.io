import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { data } from './works.js';
import Projects from './Projects.jsx';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home_projects'
import Headingbartype2 from './Components/Headingbartype2/Headingbartype2';
import Imagetop from './Components/Imagebox/Imgtop';
import Imagebottom from './Components/Imagebox/Imgbottom';

import Bookmarkbar from "./Components/Bookmarkbar/Bookmarkbar";
import Des from "./Components/Descriptionbox/Des";
import Navbar from './Navbar';
import { TabTitle } from './utils/GeneralFunctions';



function Workpage() {

    const { url } = useParams();
    const [list, setList] = useState(null)

    useEffect(() => {
        const list = data.find((list) => list.title.toLowerCase().replace(/ /g, "_") === url)
        TabTitle(`Pranav Shekhawat - ${list.title}`);
        setList(list);
    }, [url]);



    const [isHovering, setisHovering] = useState(false);
    function fillcolour() {
        return `more_arrow_right ${isHovering ? "more_fillcolor" : "more_fillwhite"} `
    }

    const [isHovering2, setisHovering2] = useState(false);

    function fillcolour2() {
        return `more_arrow_right_2 ${isHovering2 ? "more_fillcolor" : "more_fillwhite"} `
    }


    if (!list) {
        return <Projects />;
    }

    const { index, title, topimg, body, category, bookmarks, description, bottomimg } = list;

    const prevWork = data.find((list) => list.index === index - 1);
    const nextWork = data.find((list) => list.index === index + 1);



    return (
        <>
            <Navbar />

            <div className="blog-wrap">
                <BasicBreadcrumbs text={title} theme="light"></BasicBreadcrumbs>
                <Headingbartype2 heading={title} theme="light" category={category}></Headingbartype2>

                <Bookmarkbar bookmarks={bookmarks} />
                <Imagetop src={topimg}></Imagetop>
                <Des desc={description} />

                <section className="grey">
                    {body}
                </section>

                {/* <Headingbar heading="" description="" /> */}
                <Imagebottom src={bottomimg}></Imagebottom>


                <div className='grey grid_container_25'>
                    <div className='colstart2 colend25'>

                        <div className="more_work">


                            <section className="more_worklist">

                                {prevWork && (
                                    <Link to={`/work/${prevWork.title.toLowerCase().replace(/ /g, "_")}`}>
                                        <article className="more_work" onMouseEnter={() => setisHovering(true)} onMouseLeave={() => setisHovering(false)}>
                                            <div className="more_work_img_div">
                                                <img src={prevWork.topimg} alt='' />
                                            </div>

                                            <div className="more_plate">
                                                <p className="more_category">{prevWork.category.charAt(0).toUpperCase() + prevWork.category.slice(1)}</p>
                                                <svg className={fillcolour()} viewBox="0 0 24 24" aria-hidden="true" >
                                                    <path style={{ rotate: "180deg", transform: "translateX(-24px) translateY(-26px)" }} d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"></path>
                                                </svg>
                                                <p className="more_title">{prevWork.title}</p>
                                            </div>


                                        </article>
                                    </Link>
                                )}
                                {nextWork && (
                                    <Link to={`/work/${nextWork.title.toLowerCase().replace(/ /g, "_")}`}>
                                        <article className="more_work_2" onMouseEnter={() => setisHovering2(true)} onMouseLeave={() => setisHovering2(false)}>
                                            <div className="more_work_img_div">
                                                <img src={nextWork.topimg} alt='' />
                                            </div>

                                            <div className="more_plate">
                                                <p className="more_category">{nextWork.category.charAt(0).toUpperCase() + nextWork.category.slice(1)}</p>
                                                <svg className={fillcolour2()} viewBox="0 0 24 24" aria-hidden="true" >
                                                    <path d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"></path>
                                                </svg>
                                                <p className="more_title">{nextWork.title}</p>
                                            </div>


                                        </article>
                                    </Link>
                                )}
                            </section>


                        </div>

                    </div>
                </div>
            </div>

        </>
    );
};

export default Workpage;