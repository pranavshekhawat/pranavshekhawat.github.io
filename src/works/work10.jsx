import React from "react";
import Img from "../Components/gallerygrid/Img";
import Gallerygrid from "../Components/gallerygrid/Gallerygrid";
import Accordion from 'react-bootstrap/Accordion';

// import Text from "../Components/pageblocks/Text";
// import Accordion from 'react-bootstrap/Accordion';

// import Btn from "../Components/pageblocks/Btn";

function Work7() {

    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>

                    <br /><br />
                    <br /><br />
                    <span id="certificate" className="bookmark_positioner"></span>
                    <h1>Certificate</h1>
                    <br></br>

                    <Gallerygrid images={<>
                        <Img height="auto" src='/images/works/internship/Pranav Shekhawat_Certificate for completion of Internship at Raymond Ltd.png' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited " />
                        {/* <Img height="auto" src='/images/works/internship/noimg.png' alt="" /> */}

                    </>} />
                    <br /><br />
                    <br /><br />

                    <br /><br />
                    <span id="brief" className="bookmark_positioner"></span>
                    <h1>Brief</h1>
                    <br></br>
                    <div className="text halffull">
                        The brief was to develop suiting fabric designs for the ss-23 collection by referring to the trend forecast and swatch inventory. The deliverables included a mood board, colour palette, and 2-3 swatches of each category; Micro Designs, Checks and Stripes.
                    </div>


                    <br /><br />
                    <br /><br />
                    <span id="moodboard" className="bookmark_positioner"></span>
                    <h1>Mood Board</h1>
                    <br></br>
                    <div className="text">
                    By broadening the ideal definition of masculinity, this theme makes one consider a man's vulnerable and sensitive side. It takes forward the WGSN's "soft masculinity" trend and creates space for softer aesthetics and elegant details in men's clothing.
                    </div>
                    <br />

                    <Gallerygrid images={<>
                        <Img height="auto" src='\images\works\internship\aa (1).jpg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Mood Board" />
                    </>} />



                    <br /><br />
                    <br /><br />
                    <span id="colourboard" className="bookmark_positioner"></span>
                    <h1>Colour Palette</h1>
                    <br></br>
                    <div className="text">
                    Referred to WGSN's SS-23 Men's colour forecast and made the colour palette which includes colours from Raymond's classic colour palette. Due to the production feasibility and availability constraints, we made a few changes later. 
                    </div>
                    <br />

                    <Gallerygrid images={<>
                        <Img height="auto" src='\images\works\internship\aa (2).jpg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Colour Palette" />
                    </>} />




                    <br /><br />
                    <br /><br />

                    <span id="jacquard" className="bookmark_positioner"></span>
                    <h1>Jacquard Designs</h1>
                    <br></br>
                    <div className="text">
                        Made jacquard designs for shirting fabrics on Textronics-Design Jacquard.
                    </div>
                    <br />

                    <h6>Design 1</h6>

                    <Gallerygrid images={<>
                        <img style={{ width: '50%' }} height="auto" src='\images\works\internship\rotatingsnake-03.svg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Jacquard Design 1" />
                        {/* <Img height="100" src='\images\works\internship\PR-2_2.jpg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Jacquard Design 1 CAD" /> */}

                    </>} />
                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>CAD</Accordion.Header>
                            <Accordion.Body>
                                <Gallerygrid images={<>
                                    <Img height="auto" src='\images\works\internship\PR-2_2.jpg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Jacquard Design 1 CAD" />
                                </>} />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <h6>Design 2</h6>
                    <Gallerygrid images={<>
                        <img style={{ width: '50%' }} height="auto" src='\images\works\internship\Untitled-1.webp' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Jacquard Design 1" />
                        {/* <Img height="100" src='\images\works\internship\PR-2_2.jpg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Jacquard Design 1 CAD" /> */}

                    </>} />
                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>CAD</Accordion.Header>
                            <Accordion.Body>
                                <Gallerygrid images={<>
                                    <Img height="auto" src='\images\works\internship\PR-1_1.jpg' alt="Pranav Shekhawat | Internship | Internship Experience at Raymond Limited | Jacquard Design 1 CAD" />
                                </>} />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <br /><br />
                    <br /><br />


                </div>

            </div>



        </>
    )
}

export default Work7;