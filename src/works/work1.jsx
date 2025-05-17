<<<<<<< HEAD
import React from "react";
import Img from "../Components/gallerygrid/Img";
import Text from "../Components/pageblocks/Text";
import Accordion from 'react-bootstrap/Accordion';

// import Btn from "../Components/pageblocks/Btn";

function Work1() {

    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>

                    <br />
                    <br />

                    <Img height="40vw" src='/images/works/weave_design/Group_of_three_girls.webp' alt="Pranav Shekhawat | Checks and Stripes | Group of three girls by Amrita Shergill" />

                    <Text content={<><center>"Group of Three Girls" by Amrita Shergill, Oil on Canvas, 73.5 X 99.5 cm.</center></>} i={true}></Text>
                    <br />
                    <br />
                    <br />


                    <span id="colour_palette" className="bookmark_positioner"></span>
                    <h1>Colour Palette</h1>
                    <br></br>
                    <div className="text halffull">
                        Extracted colours from the painting using <a className="body_hyperlink" href="https://color.adobe.com/" target="_blank" rel="noreferrer">Adobe Color</a> and then matched them with the colours of the WGSN's Global colour forecast A/W 23/24.
                    </div>
                    <Img height="18vw" src='/images/works/weave_design/colour_palette.webp' alt="Pranav Shekhawat | Checks and Stripes | Colour Palette" />

                    <br />
                    <br />
                    <br />


                    <span id="explorations" className="bookmark_positioner"></span>
                    <h1>Explorations</h1>
                    <br></br>
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\weave_design\c1.png' alt="Exploration check 1" />
                        <Img height="auto" src='\images\works\weave_design\c2.png' alt="Exploration check 2" />
                        <Img height="auto" src='\images\works\weave_design\c3.png' alt="Exploration check 3" />
                    </div>
                    <br />
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\weave_design\s1.png' alt="Exploration stripe 1" />
                        <Img height="auto" src='\images\works\weave_design\s2.png' alt="Exploration stripe 2" />
                        <Img height="auto" src='\images\works\weave_design\s3.png' alt="Exploration stripe 3" />
                    </div>
                    <br />
                    <br />
                    <br />

                   

                    {/*/////////////////// swatch 1/////////////// */}
                    <span id="swatch_1" className="bookmark_positioner"></span>
                    <h1>Swatch 1</h1>
                    <br></br>

                    <Img height="85vw" src='/images/works/weave_design/swatch1.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit1.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet1.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 2 /////////////// */}
                    <span id="swatch_2" className="bookmark_positioner"></span>
                    <h1>Swatch 2</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 | Weave Unit on CAD" />
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 3 /////////////// */}
                    <span id="swatch_3" className="bookmark_positioner"></span>
                    <h1>Swatch 3</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 4 /////////////// */}
                    <span id="swatch_4" className="bookmark_positioner"></span>
                    <h1>Swatch 4</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 | Weave Unit on CAD" />

                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 5 /////////////// */}
                    <span id="swatch_5" className="bookmark_positioner"></span>
                    <h1>Swatch 5</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit5.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 | Weave Unit on CAD" />

                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet5.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 | Specification Sheet" />


                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    <span id="altogether" className="bookmark_positioner"></span>
                    <h1>Altogether</h1>
                    <br></br>

                    <Img height="40vw" src='/images/works/weave_design/all_weaves.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <br />
                    <br />
                    <br />

                    <div className='overflowhidden'>
                        <div className='displayflex gridgap'>
                            <Img height="26vw" src='/images/works/weave_design/process_img1.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 1" />
                            <Img height="26vw" src='/images/works/weave_design/process_img2.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 2" />
                            <Img height="26vw" src='/images/works/weave_design/process_img3.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 2" />
                        </div>
                    </div>
                    <br />
                    <br />
                    <br />



                </div>
            </div>


        </>
    )
}

=======
import React from "react";
import Img from "../Components/gallerygrid/Img";
import Text from "../Components/pageblocks/Text";
import Accordion from 'react-bootstrap/Accordion';

// import Btn from "../Components/pageblocks/Btn";

function Work1() {

    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>

                    <br />
                    <br />

                    <Img height="40vw" src='/images/works/weave_design/Group_of_three_girls.webp' alt="Pranav Shekhawat | Checks and Stripes | Group of three girls by Amrita Shergill" />

                    <Text content={<><center>"Group of Three Girls" by Amrita Shergill, Oil on Canvas, 73.5 X 99.5 cm.</center></>} i={true}></Text>
                    <br />
                    <br />
                    <br />


                    <span id="colour_palette" className="bookmark_positioner"></span>
                    <h1>Colour Palette</h1>
                    <br></br>
                    <div className="text halffull">
                        Extracted colours from the painting using <a className="body_hyperlink" href="https://color.adobe.com/" target="_blank" rel="noreferrer">Adobe Color</a> and then matched them with the colours of the WGSN's Global colour forecast A/W 23/24.
                    </div>
                    <Img height="18vw" src='/images/works/weave_design/colour_palette.webp' alt="Pranav Shekhawat | Checks and Stripes | Colour Palette" />

                    <br />
                    <br />
                    <br />


                    <span id="explorations" className="bookmark_positioner"></span>
                    <h1>Explorations</h1>
                    <br></br>
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\weave_design\c1.png' alt="Exploration check 1" />
                        <Img height="auto" src='\images\works\weave_design\c2.png' alt="Exploration check 2" />
                        <Img height="auto" src='\images\works\weave_design\c3.png' alt="Exploration check 3" />
                    </div>
                    <br />
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\weave_design\s1.png' alt="Exploration stripe 1" />
                        <Img height="auto" src='\images\works\weave_design\s2.png' alt="Exploration stripe 2" />
                        <Img height="auto" src='\images\works\weave_design\s3.png' alt="Exploration stripe 3" />
                    </div>
                    <br />
                    <br />
                    <br />

                   

                    {/*/////////////////// swatch 1/////////////// */}
                    <span id="swatch_1" className="bookmark_positioner"></span>
                    <h1>Swatch 1</h1>
                    <br></br>

                    <Img height="85vw" src='/images/works/weave_design/swatch1.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit1.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet1.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 2 /////////////// */}
                    <span id="swatch_2" className="bookmark_positioner"></span>
                    <h1>Swatch 2</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 | Weave Unit on CAD" />
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 3 /////////////// */}
                    <span id="swatch_3" className="bookmark_positioner"></span>
                    <h1>Swatch 3</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 4 /////////////// */}
                    <span id="swatch_4" className="bookmark_positioner"></span>
                    <h1>Swatch 4</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 | Weave Unit on CAD" />

                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 5 /////////////// */}
                    <span id="swatch_5" className="bookmark_positioner"></span>
                    <h1>Swatch 5</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/weave_unit5.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 | Weave Unit on CAD" />

                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/weave_design/specification_sheet5.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 | Specification Sheet" />


                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />

                    <span id="altogether" className="bookmark_positioner"></span>
                    <h1>Altogether</h1>
                    <br></br>

                    <Img height="40vw" src='/images/works/weave_design/all_weaves.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <br />
                    <br />
                    <br />

                    <div className='overflowhidden'>
                        <div className='displayflex gridgap'>
                            <Img height="26vw" src='/images/works/weave_design/process_img1.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 1" />
                            <Img height="26vw" src='/images/works/weave_design/process_img2.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 2" />
                            <Img height="26vw" src='/images/works/weave_design/process_img3.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 2" />
                        </div>
                    </div>
                    <br />
                    <br />
                    <br />



                </div>
            </div>


        </>
    )
}

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Work1;