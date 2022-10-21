import React from 'react';
import Contact from './Contact';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home';
import Headingbar from './Components/Headingbar/Headingbar';
import Navbar from './Navbar';
import './css/about.css'
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import { TabTitle } from './utils/GeneralFunctions';
// import emailjs from 'emailjs-com';
// import { useRef, useState, useEffect } from 'react';


const data = [{
    name: 'Pranav Shekhawat',
    img: ["/images/about/aboutimg22.jpg", "/images/about/aboutimg3.jpg", "/images/about/aboutimg1.jpg"],
}]


const Active = ({ img, name }) => {

    const [modalShow, setModalShow] = React.useState(false);

    return (
        <>
            <article className="about">
                
                <span onClick={() => setModalShow(true)} className="about_span">

                    {img?.length > 1 && <button className='about_img_btn'>+{img.length - 1}</button>}


                    <div className='about_img_div'>
                        <img src={img[0]} alt={`Images of ${name}`} />
                    </div>
                </span>
            </article>
            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                dialogClassimg="modal-90w"
                aria-labelledby="example-custom-modal-styling-title"
                centered
            >
                <Modal.Header closeButton closeVariant='dark'>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel variant='dark'>

                        {img.map((img) => <Carousel.Item >
                            <div className="about_carousel_image_container">
                                <img className="about_carousel_img" src={img} alt="First slide" />
                            </div>
                        </Carousel.Item>)}

                    </Carousel>
                </Modal.Body>
            </Modal>
        </>
    )
}

function AboutCard(){

    
    // const [sentmessagestate, setsentmessagestate] = useState(false);

    // const form = useRef();

    // const sendEmail = (e) => {
    //     e.preventDefault();

    //     emailjs.sendForm('service_7dxprkh', 'template_oa96v9w', form.current, 'JMJtFiGuZ1PHXNXp0')
    //         .then((result) => {
    //             console.log(result.text);
    //         }, (error) => {
    //             console.log(error.text);
    //         });
    // };

    // useEffect(() => {
    //     if(sentmessagestate){
    //         document.getElementById("myform").reset();
    //     setTimeout(function () {
    //         setsentmessagestate(false);
            
    //     }, 3000);}
    // },
    //     [sentmessagestate])

   return(

    <div className='grid_container_25'>
                <div className='colstart2 colend25'>
                    <div className='grid_container_2 main_about_container'>

                        <div className="">
                            {data.map((list) => {
                                return <Active key={list.name}{...data[0].img}{...list}></Active>
                            })}
                        </div>
                        <div className="colstart2 colend4 abouttext">
                        Hello! I am Pranav Shekhawat, a design student at the National Institute of Fashion Technology, Gandhinagar, specialising in textiles. The wonders of nature and the advances in the digital world inspire me. My ability to understand the technical aspects of production processes is swift, and my skill with CAD tools helps me to execute my design ideas effectively.<br/>
                            Feel free to contact me if you need any further information. I would love to hear from you.
                            <br />
                            <br />
                            {/* <a className='contact_download_cv' href='/data/cv/PranavShekhawat_CV.pdf' target="_blank">View CV</a>
                            <br />
                            <br />
                            <br /> */}

                            {/* <form ref={form} onSubmit={sendEmail} id="myform">
                                <label>Name:</label><br />
                                <input className="contact_name" type="text" name="from_name" placeholder="Enter your name." /><br />
                                <label>Email:</label><br />
                                <input className="contact_email" type="email" name="user_email" placeholder="Enter your email address." /><br />
                                <label>Message:</label><br />
                                <textarea className="contact_message" name="message" placeholder="Write your message." /><br />
                                <input className='contact_submit_button' type="submit" value="Send" onClick={() => setsentmessagestate(true)} />
                                &nbsp;&nbsp;&nbsp;
                                {sentmessagestate ? <span> Your message has been successfully sent.</span> : <></>}

                            </form> */}


                        </div>

                    </div>

                </div>
            </div>

   );

}

function About() {

    TabTitle('Pranav Shekhawat - About');

    return (
        <>
            <Navbar />
            <BasicBreadcrumbs text="About" theme="dark"></BasicBreadcrumbs>
            <Headingbar heading="About"></Headingbar>

            <AboutCard/>

            <Contact />
        </>
    )
}

export default About;
export {AboutCard};