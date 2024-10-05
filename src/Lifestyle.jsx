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


function Lifestyle() {

    // Local data for the post (You can modify this data)
    const postData = {
        title: "Lifestyle International Pvt. Ltd.",
        topimg: "/path/to/top/image.jpg", // Image URL
        body: "This is the body of the post.",
        category: "Work Experience",
        bookmarks: (
            <>
              <Mark to="#overview" title="Overview" />
              <Mark to="#aw24" title="AW24 Shirts" />
            </>
          ),
        description: "This is the description of the post.",
        bottomimg: "/path/to/bottom/image.jpg"
    };

    const { title, topimg, body, category, bookmarks, description, bottomimg } = postData;

    return (
        <>
            <Navbar />
            <div className="blog-wrap">
                {/* <BasicBreadcrumbs text={title} theme="light" /> */}
                <Headingbartype2 heading={title} theme="light" category={category} />

                <Bookmarkbar bookmarks={bookmarks} />
                <Imagetop src={topimg} />
                <Des desc={description} />

                <section className="grey">{body}</section>

                <Imagebottom src={bottomimg} />
            </div>
        </>
    );
}

export default Lifestyle;
