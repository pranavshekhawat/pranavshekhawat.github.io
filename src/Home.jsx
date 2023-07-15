import React from 'react';
// import Contact from './Contact';
import Navbar from './Navbar';
// import Carousel from 'react-bootstrap/Carousel';
import "./css/carousel.css";
import { Works } from "./Projects";
import { TabTitle } from './utils/GeneralFunctions';
// import {AboutCard} from './About';
import Headingbar from './Components/Headingbar/Headingbar';
import { AboutCard } from "./About";
import Contact from './Contact';
import  { Auth  } from './utils/auth';

// jhbhdvasjv

function Home() {

    TabTitle('Pranav Shekhawat - Portfolio');

    return (
        <>
            <Navbar />
            {/* <Carousel>
                <Carousel.Item>
                    <div className="carousel_image_container"> <img
                        className="carousel_img"
                        src="/images/works/weave_design/weavedesign.webp"
                        alt="First slide"
                    />
                    </div>
                    <Carousel.Caption>
                        <h3>Checks and Stripes</h3>
                        <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="carousel_image_container">
                        <img
                            className="carousel_img"
                            src="/images/works/naturaldyes/natural_dyes_poster.webp"
                            alt="Second slide"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Natural Dyes</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="carousel_image_container">
                        <img
                            className="carousel_img"
                            src="/images/works/digital_nature/digital_nature2.webp"
                            alt="Third slide"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Digital Nature</h3>
                        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                    </Carousel.Caption>
                </Carousel.Item>


            </Carousel> */}
            {/* <br/><br/> */}
            {/* <Works/><hr/><br/><br/>
            <AboutCard/><br/><br/>
            <Contact /> */}

            <span id="projects" className="bookmark_positioner_nav"></span>

            <Headingbar heading="Projects" description="" />
            {/* Here are my few selected projects that show my woking process */}

            <Works />

            <span id="about" className="bookmark_positioner_nav"></span>

            <Headingbar heading="About"></Headingbar>

            <AboutCard />

            <span id="contact" className="bookmark_positioner_nav"></span>
            <Headingbar heading="Contact"></Headingbar>

            <Contact />
            <span id="signin" className="bookmark_positioner_nav"></span>
            <Headingbar heading="Sign In"></Headingbar>
            <Auth/>

        </>
    )
}

export default Home;