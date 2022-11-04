import React from "react";
import Img from "../Components/gallerygrid/Img";
// import Text from "../Components/pageblocks/Text";
// import Accordion from 'react-bootstrap/Accordion';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
// import Carousel from 'react-bootstrap/Carousel';

// import Btn from "../Components/pageblocks/Btn";

function Work11() {

    // const [modalShow, setModalShow] = React.useState(false);

    // const values = [true, 'sm-down', 'md-down', 'lg-down', 'xl-down', 'xxl-down'];
    // const [fullscreen, setFullscreen] = useState(true);
    // const [show, setShow] = useState(false);

    // function handleShow(breakpoint) {
    //     setFullscreen(breakpoint);
    //     setShow(true);
    //   }

    return (
        <>
            <div className='grid_container_25 different_modal'>
                <div className='colstart3 colend24'>





                    <br /><br />
                    <br /><br />
                    <span id="swatches" className="bookmark_positioner"></span>
                    <h1>Swatches</h1>
                    <br></br>
                    {/* <div className="text">
                        Selected "Givenchy" and studied the brand and their last two years' print collections.
                    </div> */}
                    {/* <br /><br /> */}

                    {/* <Img height="auto" src='\images\works\dyeing_techniques\one (2).png' alt="Pranav Shekhawat | Checks and Stripes | Process Image 1" /> */}

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\boro\swatch1.webp' alt="Pranav Shekhawat | Boro Swatches" />
                        <Img height="auto" src='\images\works\boro\swatch2.webp' alt="Pranav Shekhawat | Boro Swatches" />
                    </div>
                    <br />

                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\boro\swatch3.webp' alt="Pranav Shekhawat | Boro Swatches" />
                        <Img height="auto" src='\images\works\boro\swatch4.webp' alt="Pranav Shekhawat | Boro Swatches" />
                    </div>
                    <br /><br />
                    <br /><br />
                    <span id="productmapping" className="bookmark_positioner"></span>
                    <h1>Product Mapping</h1>
                    <br></br>
                    <h6>Sofa Chair</h6>
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\boro\one.webp' alt="Pranav Shekhawat | Leheria" />
                        <Img height="auto" src='\images\works\boro\one2.webp' alt="Pranav Shekhawat | Leheria" />

                    </div>
                   
                    <br /><br />
                    <br /><br />

                    <span id="totebag" className="bookmark_positioner"></span>
                    <h1>Tote Bag</h1>
                    <br></br>
                    {/* <h6>Sofa Chair</h6> */}
                    <div className="overflowhidden gridgap noflexinphone" >
                        <Img height="auto" src='\images\works\boro\two.webp' alt="Pranav Shekhawat | Tote bag" />
                        <Img height="auto" src='\images\works\boro\two2.webp' alt="Pranav Shekhawat | Tote bag" />

                    </div>
                    <br /><br />
                    <br /><br />
                </div>

            </div>



        </>
    )
}

export default Work11;