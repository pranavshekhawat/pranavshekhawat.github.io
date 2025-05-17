<<<<<<< HEAD
import React from 'react';
// import Projects from './Projects.jsx';
// import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home_projects.jsx';
import Headingbartype2 from './Components/Headingbartype2/Headingbartype2.jsx';
import Imagetop from './Components/Imagebox/Imgtop.jsx';
import Imagebottom from './Components/Imagebox/Imgbottom.jsx';
import Bookmarkbar from "./Components/Bookmarkbar/Bookmarkbar.jsx";
import Des from "./Components/Descriptionbox/Des.jsx";
import Navbar from './Navbar.jsx';
import Mark from "./Components/Bookmarkbar/mark";
import Img from './Components/gallerygrid/Img.jsx';


function Lifestyle() {

    // Local data for the post (You can modify this data)
    const postData = {
        title: "Lifestyle International Pvt. Ltd.",
        topimg: "/images/works/lifestyle/topimg.png", // Image URL
        body: "This is the body of the post.",
        category: "Work Experience",
        bookmarks: (
            <>
                <Mark to="#overview" title="Overview" />
                <Mark to="#fameforever" title="Fame Forever" />
                <Mark to="#denimize" title="Denimize" />
                <Mark to="#firstteam" title="First Team" />
                <Mark to="#bossini" title="Bossini" />
                <Mark to="#forca" title="Forca" />
                <Mark to="#forcanxt" title="Forca NXT" />

            </>
        ),
        description: (
            <>

                {`During my one-year tenure at Lifestyle International Pvt. Ltd., I had the opportunity to design shirts for the brand’s private labels. My work focused on creating a range of shirts which included yarn-dyed shirts and all-over printed (AOPs) shirts for AW24 and SS25. 
          `}
                <br /><br />
                {` For the Autumn/Winter 2024 season, I developed a collection that reflects the latest trends, combining versatile patterns with a strong emphasis on quality and style. I’m excited to see these designs come to life and eager to share more of my work soon.`}
            </>
        ),
        bottomimg: "/images/works/lifestyle/bottomimg.jpg"
    };

    const { title, topimg, category, bookmarks, description, bottomimg } = postData;

    return (
        <>
            <Navbar />
            <div className="blog-wrap">
                {/* <BasicBreadcrumbs text={title} theme="light" /> */}
                <Headingbartype2 heading={title} theme="light" category={category} />

                <Bookmarkbar bookmarks={bookmarks} />
                <Imagetop src={topimg} />
                <Des desc={description} />

                <section className="grey">
                    <div className='grid_container_25'>
                        <div className='colstart3 colend24'>

                            <br /><br />
                            <br /><br />



                            <span id="fameforever" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a0.png' alt="documant page 0" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a1.png' alt="documant page 1" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a2.png' alt="documant page 2" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a3.png' alt="documant page 3" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a4.jpg' alt="documant page 4" />
                            </div>
                            <br />

                            <span id="denimize" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a5.png' alt="documant page 5" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a6.png' alt="documant page 6" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a7.png' alt="documant page 7" />
                            </div>
                            <br />

                            <span id="firstteam" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a8.png' alt="documant page 8" />
                            </div>
                            <br />

                            
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a9.png' alt="documant page 9" />
                            </div>
                            <br />

                           
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a10.png' alt="documant page 10" />
                            </div>
                            <br />

                            <span id="bossini" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a11.png' alt="documant page 11" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a12.png' alt="documant page 12" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a13.png' alt="documant page 13" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a14.png' alt="documant page 14" />
                            </div>
                            <br />

                            <span id="forca" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a15.png' alt="documant page 15" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a16.png' alt="documant page 16" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a17.png' alt="documant page 17" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a18.png' alt="documant page 18" />
                            </div>
                            <br />

                            <span id="forcanxt" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a19.png' alt="documant page 19" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a20.png' alt="documant page 20" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a21.png' alt="documant page 21" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a22.png' alt="documant page 22" />
                            </div>
                            <br />

                            <br />
                            <br /><br /><br />

                        </div>
                    </div>
                </section>

                <Imagebottom src={bottomimg} />
            </div>
        </>
    );
}

export default Lifestyle;
=======
import React from 'react';
// import Projects from './Projects.jsx';
// import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home_projects.jsx';
import Headingbartype2 from './Components/Headingbartype2/Headingbartype2.jsx';
import Imagetop from './Components/Imagebox/Imgtop.jsx';
import Imagebottom from './Components/Imagebox/Imgbottom.jsx';
import Bookmarkbar from "./Components/Bookmarkbar/Bookmarkbar.jsx";
import Des from "./Components/Descriptionbox/Des.jsx";
import Navbar from './Navbar.jsx';
import Mark from "./Components/Bookmarkbar/mark";
import Img from './Components/gallerygrid/Img.jsx';


function Lifestyle() {

    // Local data for the post (You can modify this data)
    const postData = {
        title: "Lifestyle International Pvt. Ltd.",
        topimg: "/images/works/lifestyle/topimg.png", // Image URL
        body: "This is the body of the post.",
        category: "Work Experience",
        bookmarks: (
            <>
                <Mark to="#overview" title="Overview" />
                <Mark to="#fameforever" title="Fame Forever" />
                <Mark to="#denimize" title="Denimize" />
                <Mark to="#firstteam" title="First Team" />
                <Mark to="#bossini" title="Bossini" />
                <Mark to="#forca" title="Forca" />
                <Mark to="#forcanxt" title="Forca NXT" />

            </>
        ),
        description: (
            <>

                {`During my one-year tenure at Lifestyle International Pvt. Ltd., I had the opportunity to design shirts for the brand’s private labels. My work focused on creating a range of shirts which included yarn-dyed shirts and all-over printed (AOPs) shirts for AW24 and SS25. 
          `}
                <br /><br />
                {` For the Autumn/Winter 2024 season, I developed a collection that reflects the latest trends, combining versatile patterns with a strong emphasis on quality and style. I’m excited to see these designs come to life and eager to share more of my work soon.`}
            </>
        ),
        bottomimg: "/images/works/lifestyle/bottomimg.jpg"
    };

    const { title, topimg, category, bookmarks, description, bottomimg } = postData;

    return (
        <>
            <Navbar />
            <div className="blog-wrap">
                {/* <BasicBreadcrumbs text={title} theme="light" /> */}
                <Headingbartype2 heading={title} theme="light" category={category} />

                <Bookmarkbar bookmarks={bookmarks} />
                <Imagetop src={topimg} />
                <Des desc={description} />

                <section className="grey">
                    <div className='grid_container_25'>
                        <div className='colstart3 colend24'>

                            <br /><br />
                            <br /><br />



                            <span id="fameforever" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a0.png' alt="documant page 0" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a1.png' alt="documant page 1" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a2.png' alt="documant page 2" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a3.png' alt="documant page 3" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a4.jpg' alt="documant page 4" />
                            </div>
                            <br />

                            <span id="denimize" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a5.png' alt="documant page 5" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a6.png' alt="documant page 6" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a7.png' alt="documant page 7" />
                            </div>
                            <br />

                            <span id="firstteam" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a8.png' alt="documant page 8" />
                            </div>
                            <br />

                            
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a9.png' alt="documant page 9" />
                            </div>
                            <br />

                           
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a10.png' alt="documant page 10" />
                            </div>
                            <br />

                            <span id="bossini" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a11.png' alt="documant page 11" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a12.png' alt="documant page 12" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a13.png' alt="documant page 13" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a14.png' alt="documant page 14" />
                            </div>
                            <br />

                            <span id="forca" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a15.png' alt="documant page 15" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a16.png' alt="documant page 16" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a17.png' alt="documant page 17" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a18.png' alt="documant page 18" />
                            </div>
                            <br />

                            <span id="forcanxt" className="bookmark_positioner"></span>
                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a19.png' alt="documant page 19" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a20.png' alt="documant page 20" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a21.png' alt="documant page 21" />
                            </div>
                            <br />

                            <div className="overflowhidden  noflexinphone">
                                <Img height="auto" src='\images\works\lifestyle\a22.png' alt="documant page 22" />
                            </div>
                            <br />

                            <br />
                            <br /><br /><br />

                        </div>
                    </div>
                </section>

                <Imagebottom src={bottomimg} />
            </div>
        </>
    );
}

export default Lifestyle;
>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
