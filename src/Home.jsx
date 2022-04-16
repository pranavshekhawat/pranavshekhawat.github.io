import React from 'react';
import Contact from './Contact';
import Navbar from './Navbar';
import Carousel from 'react-bootstrap/Carousel';
import "./css/carousel.css";
import {Works} from "./Projects";
import { TabTitle } from './utils/GeneralFunctions';
import {AboutCard} from './About'

function Home() {

    TabTitle('Pranav Shekhawat - Home');

    return (
        <> 
        <Navbar/>
            <Carousel>
                <Carousel.Item>
                    <div className="carousel_image_container"> <img
                        className="carousel_img"
                        src="/images/work1/workimage2.jpg"
                        alt="First slide"
                    />
                    </div>
                    <Carousel.Caption>
                        <h3>First slide label</h3>
                        <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <div className="carousel_image_container">
                        <img
                            className="carousel_img"
                            src="/images/work1/workimage1.jpg"
                            alt="Second slide"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Second slide label</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <div className="carousel_image_container">
                        <img
                            className="carousel_img"
                            src="/images/work1/workimage2.jpg"
                            alt="Third slide"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Third slide label</h3>
                        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
            {/* <br/><br/> */}
            {/* <Works/><hr/><br/><br/>
            <AboutCard/><br/><br/>
            <Contact /> */}

        </>
    )
}

export default Home;