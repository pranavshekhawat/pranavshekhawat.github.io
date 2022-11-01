import React from "react";
import Img from "../Components/gallerygrid/Img";
// import Text from "../Components/pageblocks/Text";
// import Accordion from 'react-bootstrap/Accordion';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
// import Carousel from 'react-bootstrap/Carousel';

// import Btn from "../Components/pageblocks/Btn";

function Work6() {

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
                    <span id="brand" className="bookmark_positioner"></span>
                    <h1>Brand</h1>
                    <br></br>
                    <div className="text">
                        Selected "Givenchy" and studied the brand and their last two years' print collections.
                    </div>
                    <br /><br />

                    
                        <Img height="auto" src='/images/works/digital_nature/2.jpeg' alt="Pranav Shekhawat | Print Design | Digital Nature " />
                  
                    
                        <Img height="auto" src='/images/works/digital_nature/3.jpeg' alt="Pranav Shekhawat | Print Design | Digital Nature " />
                  

                    <br /><br />
                    <br /><br />
                    <span id="inspiration" className="bookmark_positioner"></span>
                    <h1>Inspiration</h1>
                    <br></br>

                    
                        <Img height="auto" src='/images/works/digital_nature/6.jpeg' alt="Pranav Shekhawat | Print Design | Digital Nature " />
                  
                    <br /><br />
                    <br /><br />



                    {/*  <div className='overflowhidden'>
                        <div className='displayflex gridgap'>
                        <span onClick={() => setModalShow(true)} className="picture_span">
                            <div className='picture_img_div'>
                                <Img height="auto" src='/images/works/digital_nature/6.jpeg' alt="Pranav Shekhawat | Dyeing Techniques | Tie and Dye " />
                            </div>
                        </span>
                        <span onClick={() => setModalShow(true)} className="picture_span">
                            <div className='picture_img_div'>
                                <Img height="auto" src='/images/works/digital_nature/6.jpeg' alt="Pranav Shekhawat | Dyeing Techniques | Tie and Dye " />
                            </div>
                        </span>
                        <span onClick={() => setModalShow(true)} className="picture_span">
                            <div className='picture_img_div'>
                                <Img height="auto" src='/images/works/digital_nature/6.jpeg' alt="Pranav Shekhawat | Dyeing Techniques | Tie and Dye " />
                            </div>
                        </span>
                    </div>
                    </div>
                    <br /><br />
                    <br /><br /> */}

                    {/* {values.map((v, idx) => (
                        <Button key={idx} className="me-2 mb-2" onClick={() => handleShow(v)}>
                            Full screen
                            {typeof v === 'string' && `below ${v.split('-')[0]}`}
                        </Button>
                    ))}
                    <Modal contentClassName="picture" show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Modal</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Modal body content</Modal.Body>
                    </Modal> */}

                    {/* <Modal
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        aria-labelledby="example-custom-modal-styling-title"
                        centered
                    >
                        <Modal.Header closeButton closeVariant='dark'>
                            <Modal.Title id="contained-modal-title-vcenter">

                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Carousel variant='dark'>

                                <Carousel.Item >
                                    <div className="picture_carousel_image_container">
                                        <img className="picture_carousel_img" src="/images/works/digital_nature/6.jpeg" alt="First slide" />
                                    </div>
                                   
                                </Carousel.Item>
                                <Carousel.Item >
                                  
                                    <div className="picture_carousel_image_container">
                                        <img className="picture_carousel_img" src="" alt="Second slide" />
                                    </div>
                                </Carousel.Item>

                            </Carousel>
                        </Modal.Body>
                    </Modal> */}

                </div>

            </div>



        </>
    )
}

export default Work6;