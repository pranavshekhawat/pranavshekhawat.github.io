import React from 'react';
import Img from "../Components/gallerygrid/Img";
// import Text from "../Components/pageblocks/Text";
import Accordion from 'react-bootstrap/Accordion';

function Work1() {
    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>

                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 1/////////////// */}
                    <span id="swatch_1" className="bookmark_positioner"></span>
                    <h1>Swatch 1</h1>
                    <br></br>
                    FRONT

                    <Img height="85vw" src='/images/works/colour_and_weave_effect/swatch1.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 1 " />

                    BACK

                    <Img height="85vw" src='/images/works/colour_and_weave_effect/swatch1_back.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 1 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/unit1.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 1 | Weave Unit on CAD" />

                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/swatch_1_specification_sheet.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 1 | Specification Sheet" />


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

                    <Img height="auto" src='/images/works/colour_and_weave_effect/swatch2.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 2 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/unit2.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 2 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/swatch_2_specification_sheet.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 2 | Specification Sheet" />


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
                    FRONT

                    <Img height="auto" src='/images/works/colour_and_weave_effect/swatch3.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 3 " />

                    BACK

                    <Img height="auto" src='/images/works/colour_and_weave_effect/swatch3_back.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 3 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/unit3.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 3 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/swatch_3_specification_sheet.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 3 | Specification Sheet" />


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

                    <Img height="auto" src='/images/works/colour_and_weave_effect/swatch4.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 4 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Weave Unit on CAD</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/unit4.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 4 | Weave Unit on CAD" />


                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/colour_and_weave_effect/swatch_4_specification_sheet.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Swatch 4 | Specification Sheet" />


                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br />
                    <br />
                    <br />


                    <span id="altogether" className="bookmark_positioner"></span>
                    <h1>Altogether</h1>
                    <br></br>

                    <Img height="40vw" src='/images/works/colour_and_weave_effect/altogether.jpg' alt="Pranav Shekhawat | Colour and Weave Effects | Woven Swatches " />

                    <br />
                    <br />
                    <br />




                </div>
            </div>


        </>
    )
}

export default Work1