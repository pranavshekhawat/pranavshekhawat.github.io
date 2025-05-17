<<<<<<< HEAD
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
                    <br /><br />


                    <Img height="auto" src='\images\works\illusions\a3.webp' alt="Pranav Shekhawat | Inspiration board for Maya - the art of deception" />
                    <br />
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
                    <br />
                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/illusions/ss1.png' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br /><br />
                    <div className="text halffull">
                        This swatch depicts the Munker-White illusion, in which two colours of the same intensity appear different due to their surroundings. The image below shows, two squares, A and B, surrounded by a dark grey and light grey background, respectively. Despite their identical colour intensities, square A appears lighter than square B. This illusion demonstrates how the surrounding affects our perception of colour and deceives us into believing what's untrue.
                    </div>
                    <br /><br />
                    <img height="auto" width="50%" src='/images/works/illusions/munkerw.svg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Specification Sheet" />

                    <br /><br />
                    <br /><br /><br />

                    {/*/////////////////// swatch 2 /////////////// */}
                    <span id="stitcheddc" className="bookmark_positioner"></span>
                    <h1>Stitched Double Cloth</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/illusions/stitchfront.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 " />
                    <br></br>

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\illusions\cropstitchfront.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\cropstitchback.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>
                    <br />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/illusions/ss2.png' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br /><br />
                    <div className="text halffull">
                        The double cloth itself is an illusion; you get two distinct colours and patterns on a single piece of fabric. In the picture above, we have one side completely solid blue, and the other has red-yellow checks on it.
                    </div>
                    <br /><br />
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 3 /////////////// */}
                    <span id="waddeddc" className="bookmark_positioner"></span>
                    <h1>Wadded Double Cloth</h1>
                    <br></br>
                    <div className="text halffull">
                    Wadded double cloth is created by interlacing two layers of fabric with a third layer of wadding or padding in between them, which gives the fabric extra thickness and warmth.
                    </div>
                    <br /><br />
                    <Img height="auto" src='\images\works\illusions\waddedfront.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 " />
                    <br></br>

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\illusions\cropwaddedfront.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\cropwaddedback.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>
                    <br />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/illusions/ss3.png' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <br /><br /><br />

                    {/*/////////////////// swatch 4 /////////////// */}
                    <span id="carpets" className="bookmark_positioner"></span>
                    {/* <span id="swatch_4" className="bookmark_positioner"></span> */}
                    <h1>Cut Shuttle</h1>
                    <br></br>
                    <div className="text halffull">
                    'Penrose Impossible Stairs' is an optical illusion consisting of stairs which can be depicted in a perspective drawing but cannot exist in 3-D space. Using the Cut-shuttle method, I created a dhurrie swatch representing the simple version of the illusion. 

                    </div><br />
                    <img  height="auto" width="50%"  src='/images/works/illusions/impossibleshape.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br /><br />
                    <div className="text halffull">
                        FRONT
                    </div>
                    <Img height="auto" src='/images/works/illusions/carpettwofront.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br />
                    <div className="text halffull">
                        BACK
                    </div>
                    <Img height="auto" src='/images/works/illusions/carpettwoback.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <br /><br /><br />
                    <br /><br />

                    {/*/////////////////// swatch 5 /////////////// */}
                    {/* <span id="handkc" className="bookmark_positioner"></span> */}
                    <h1>Hand Knotted</h1>
                    <br></br>
                    <div className="text halffull">
                    Below is a carpet swatch made using a hand-knotting technique by taking inspiration from Oscar Reutersvärd's 'impossible corners' illusion artworks. All the other artwork series of Oscar Reutersvärd, like 'Window in the Floor' and 'European Flags', are just fascinating.
                    </div><br />
                    <img  height="auto" width="50%"  src='/images/works/illusions/impossiblecorner.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br /><br />
                    <div className="text halffull">
                        FRONT
                    </div>
                    <Img height="auto" src='/images/works/illusions/carpetone.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br />
                    <div className="text halffull">
                        BACK
                    </div>  <Img height="auto" src='/images/works/illusions/carpetoneback.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br /> <Img height="auto" src='/images/works/illusions/twotogether.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <br /><br /><br /><br /><br />

                    <span id="jacquard" className="bookmark_positioner"></span>
                    <h1>Jacquard Designs</h1>
                    <br></br>
                    <div className="text halffull">
                    Here are a few jacquard designs that I created, taking inspiration from autokinetic illusions. Autokinetic Illusions trick our brains into believing the existence of motion in a completely stationary object. 
                    </div><br />
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\internship\Untitled-1.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\internship\rotatingsnake-03.svg' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\three.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>

                    <br /><br /><br /><br /><br />


                    <span id="altogether" className="bookmark_positioner"></span>
                    <h1>Altogether</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/illusions/alltogether.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <br /><br />


                    <br /><br /><br />

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
                    <br /><br />


                    <Img height="auto" src='\images\works\illusions\a3.webp' alt="Pranav Shekhawat | Inspiration board for Maya - the art of deception" />
                    <br />
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
                    <br />
                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/illusions/ss1.png' alt="Pranav Shekhawat | Checks and Stripes | Swatch 1 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br /><br />
                    <div className="text halffull">
                        This swatch depicts the Munker-White illusion, in which two colours of the same intensity appear different due to their surroundings. The image below shows, two squares, A and B, surrounded by a dark grey and light grey background, respectively. Despite their identical colour intensities, square A appears lighter than square B. This illusion demonstrates how the surrounding affects our perception of colour and deceives us into believing what's untrue.
                    </div>
                    <br /><br />
                    <img height="auto" width="50%" src='/images/works/illusions/munkerw.svg' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Specification Sheet" />

                    <br /><br />
                    <br /><br /><br />

                    {/*/////////////////// swatch 2 /////////////// */}
                    <span id="stitcheddc" className="bookmark_positioner"></span>
                    <h1>Stitched Double Cloth</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/illusions/stitchfront.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 " />
                    <br></br>

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\illusions\cropstitchfront.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\cropstitchback.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>
                    <br />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/illusions/ss2.png' alt="Pranav Shekhawat | Checks and Stripes | Swatch 2 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <br /><br />
                    <div className="text halffull">
                        The double cloth itself is an illusion; you get two distinct colours and patterns on a single piece of fabric. In the picture above, we have one side completely solid blue, and the other has red-yellow checks on it.
                    </div>
                    <br /><br />
                    <br />
                    <br />
                    <br />

                    {/*/////////////////// swatch 3 /////////////// */}
                    <span id="waddeddc" className="bookmark_positioner"></span>
                    <h1>Wadded Double Cloth</h1>
                    <br></br>
                    <div className="text halffull">
                    Wadded double cloth is created by interlacing two layers of fabric with a third layer of wadding or padding in between them, which gives the fabric extra thickness and warmth.
                    </div>
                    <br /><br />
                    <Img height="auto" src='\images\works\illusions\waddedfront.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 " />
                    <br></br>

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\illusions\cropwaddedfront.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\cropwaddedback.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>
                    <br />

                    <Accordion alwaysOpen >
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Specification Sheet</Accordion.Header>
                            <Accordion.Body>

                                <Img height="auto" src='/images/works/illusions/ss3.png' alt="Pranav Shekhawat | Checks and Stripes | Swatch 3 | Specification Sheet" />

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <br /><br /><br />

                    {/*/////////////////// swatch 4 /////////////// */}
                    <span id="carpets" className="bookmark_positioner"></span>
                    {/* <span id="swatch_4" className="bookmark_positioner"></span> */}
                    <h1>Cut Shuttle</h1>
                    <br></br>
                    <div className="text halffull">
                    'Penrose Impossible Stairs' is an optical illusion consisting of stairs which can be depicted in a perspective drawing but cannot exist in 3-D space. Using the Cut-shuttle method, I created a dhurrie swatch representing the simple version of the illusion. 

                    </div><br />
                    <img  height="auto" width="50%"  src='/images/works/illusions/impossibleshape.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br /><br />
                    <div className="text halffull">
                        FRONT
                    </div>
                    <Img height="auto" src='/images/works/illusions/carpettwofront.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br />
                    <div className="text halffull">
                        BACK
                    </div>
                    <Img height="auto" src='/images/works/illusions/carpettwoback.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <br /><br /><br />
                    <br /><br />

                    {/*/////////////////// swatch 5 /////////////// */}
                    {/* <span id="handkc" className="bookmark_positioner"></span> */}
                    <h1>Hand Knotted</h1>
                    <br></br>
                    <div className="text halffull">
                    Below is a carpet swatch made using a hand-knotting technique by taking inspiration from Oscar Reutersvärd's 'impossible corners' illusion artworks. All the other artwork series of Oscar Reutersvärd, like 'Window in the Floor' and 'European Flags', are just fascinating.
                    </div><br />
                    <img  height="auto" width="50%"  src='/images/works/illusions/impossiblecorner.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br /><br />
                    <div className="text halffull">
                        FRONT
                    </div>
                    <Img height="auto" src='/images/works/illusions/carpetone.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br />
                    <div className="text halffull">
                        BACK
                    </div>  <Img height="auto" src='/images/works/illusions/carpetoneback.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />
                    <br /> <Img height="auto" src='/images/works/illusions/twotogether.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 5 " />

                    <br /><br /><br /><br /><br />

                    <span id="jacquard" className="bookmark_positioner"></span>
                    <h1>Jacquard Designs</h1>
                    <br></br>
                    <div className="text halffull">
                    Here are a few jacquard designs that I created, taking inspiration from autokinetic illusions. Autokinetic Illusions trick our brains into believing the existence of motion in a completely stationary object. 
                    </div><br />
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\internship\Untitled-1.webp' alt="Pranav Shekhawat | Cropped image of front of cut double cloth." />
                        <Img height="auto" src='\images\works\internship\rotatingsnake-03.svg' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />
                        <Img height="auto" src='\images\works\illusions\three.webp' alt="Pranav Shekhawat | Cropped image of back of cut double cloth." />

                    </div>

                    <br /><br /><br /><br /><br />


                    <span id="altogether" className="bookmark_positioner"></span>
                    <h1>Altogether</h1>
                    <br></br>

                    <Img height="auto" src='/images/works/illusions/alltogether.webp' alt="Pranav Shekhawat | Checks and Stripes | Swatch 4 " />

                    <br /><br />


                    <br /><br /><br />

                </div>
            </div>


        </>
    )
}

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Work12;