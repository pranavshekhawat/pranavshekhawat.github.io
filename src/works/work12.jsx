import React from "react";
import Img from "../Components/gallerygrid/Img";
import Text from "../Components/pageblocks/Text";
import Accordion from 'react-bootstrap/Accordion';

// import Btn from "../Components/pageblocks/Btn";

function Work12() {

    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>

                <br /><br />
                    <br /><br />
                    <span id="illusions" className="bookmark_positioner"></span>
                    <h1>Illusions</h1>
                    <br></br>
                    <div className="text halffull">
                     The illusions that intrigue me the most are 'Rotating snakes' by Akiyoshi Kitaoka and his work on 'Munker-White Illusions'. 'Impossible Corners' and 'Impossible Stairs' by Oscar Reutersvärd are also outstanding.
                    </div>
                    <br /><br/>


                    <Img height="auto" src='\images\works\illusions\a3.webp' alt="Pranav Shekhawat | Inspiration board for Maya - the art of deception" />
                    <br/>
                    <Text content={<><center>1. <a href="https://www.illusionsindex.org/ir/zoellner-illusion" target="_blank" rel="noreferrer">Johann Karl Friedrich Zöllner, From The Illusion Index</a>, 2. <a href="https://www.illusionsindex.org/ir/ebbinghaus-illusion" target="_blank" rel="noreferrer">Hermann Ebbinghaus, From The Illusion Index</a>,
                    3. <a href="https://www.illusionsindex.org/i/scintillating-grid" target="_blank" rel="noreferrer"> Scintillating Grid, From The Illusion Index</a>, 4. <a href="http://www.ritsumei.ac.jp/~akitaoka/index-e.html" target="_blank" rel="noreferrer">Akiyoshi Kitaoka 2003, From Journal of Illusion</a>, 
                    5. <a href="http://www.psy.ritsumei.ac.jp/~akitaoka/shikisai2005.html" target="_blank" rel="noreferrer">White, M., White&#39;s Effect, From Illusion and colour perception by Akiyoshi Kitaoka</a>, 6. <a href="https://www.illusionsindex.org/ir/checkershadow" target="_blank" rel="noreferrer">Edward H. Adelson, From The Illusion Index</a>,
                    7. <a href="http://www.ritsumei.ac.jp/~akitaoka/index-e.html" target="_blank" rel="noreferrer">Akiyoshi Kitaoka 2003, From Journal of Illusion</a>, 8. <a href="http://engineering.utep.edu/novick/colors/impossible/" target="_blank" rel="noreferrer">David Novick, From David Novick’s Color Illusion Page: “Impossible” Munker Illusions</a>, 
                    9. <a href="https://www.illusionsindex.org/i/impossible-corners" target="_blank" rel="noreferrer">Oscar Reutersvärd, From The Illusion Index</a>. </center></>} i={true}></Text>


                    <br /><br />
                    <br /><br />


                    <span id="colour_palette" className="bookmark_positioner"></span>
                    <h1>Colour Palette</h1>
                    <br></br>
                    <Img height="8vw" src='/images/works/illusions/colourpalette.png' alt="Pranav Shekhawat | Maya - Art of Deception | Colour Palette" />

                    <br /><br /><br /><br />

                    <Img height="auto" src='/images/works/illusions/loomblue.webp' alt="Pranav Shekhawat | Table Top Loom " />


                    <br /><br />
                    <br /><br />

                    {/*/////////////////// swatch 1/////////////// */}
                    <span id="cutdc" className="bookmark_positioner"></span>
                    <h1>Cut Double Cloth</h1>
                    <br></br>
                    {/* <h6>FRONT</h6>  */}
                    <Img height="auto" src='/images/works/illusions/cutfront.webp' alt="Pranav Shekhawat | Woven swatch of cut double cloth " />
                    <br></br>

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\illusions\cropcutfront.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\classroom.jpg' alt="Pranav Shekhawat | Image of classroom showing looms." />
                        <Img height="auto" src='\images\works\illusions\cropcutback.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Peg Plan</Accordion.Header>
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
                    <br /><br /><br />

                    {/*/////////////////// swatch 2 /////////////// */}
                    <span id="stitcheddc" className="bookmark_positioner"></span>
                    <h1>Stitched Double Cloth</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch2.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 " />


                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Peg Plan</Accordion.Header>
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
                    <span id="waddeddc" className="bookmark_positioner"></span>
                    <h1>Wadded Double Cloth</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 " />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Peg Plan</Accordion.Header>
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
                    <br /><br /><br />

                    {/*/////////////////// swatch 4 /////////////// */}
                    <span id="carpets" className="bookmark_positioner"></span>
                    {/* <span id="swatch_4" className="bookmark_positioner"></span> */}
                    <h1>Swatch 4</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch4.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />
                    
                    <br /><br /><br />

                    {/*/////////////////// swatch 5 /////////////// */}
                    {/* <span id="handkc" className="bookmark_positioner"></span> */}
                    <h1>Swatch 5</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/weave_design/swatch3.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <br /><br /><br />

                    <span id="altogether" className="bookmark_positioner"></span>
                    <h1>Altogether</h1>
                    <br></br>

                    <Img height="40vw" src='/images/works/weave_design/all_weaves.jpg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <br /><br /><br />

                    <div className='overflowhidden'>
                        <div className='displayflex gridgap'>
                            <Img height="26vw" src='/images/works/weave_design/process_img1.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 1" />
                            <Img height="26vw" src='/images/works/weave_design/process_img2.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 2" />
                            <Img height="26vw" src='/images/works/weave_design/process_img3.webp' alt="Pranav Shekhawat | Checks and Stripes | Process Image 2" />
                        </div>
                    </div>
                    <br /><br /><br />

                </div>
            </div>


        </>
    )
}

export default Work12;