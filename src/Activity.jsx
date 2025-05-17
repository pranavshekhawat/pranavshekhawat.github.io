import React from 'react';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home';
import Headingbar from './Components/Headingbar/Headingbar';
import { data } from './activities';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import './css/activity.css';
import Navbar from './Navbar';
import { TabTitle } from './utils/GeneralFunctions';


const Active = ({ date, title, description, img }) => {

    var tit = title.charAt(0).toUpperCase() + title.slice(1);

    const [modalShow, setModalShow] = React.useState(false);

    return (

        <>

            <article className="activity">
                <span onClick={() => setModalShow(true)} className="activity_span">
                    
                    {img?.length > 1 && <button className='activity_img_btn'>+{img.length - 1}</button>}
                    
                    <div className='activity_img_div'>
                        <img src={img[0]} alt={`Images of ${tit}`} />
                    </div>
                </span>
                <div className="activity_plate">
                    <p className="activity_title roman">{tit}</p>
                    <p className="activity_date lt">{date}</p>
                    <p>{description}</p>
                </div>

            </article>

            <hr></hr>

            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                dialogClassName="modal-90w"
                aria-labelledby="example-custom-modal-styling-title"
                centered
            >
                <Modal.Header closeButton closeVariant='dark'>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {tit}, {date}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel variant='dark'>

                        {img.map((img) => <Carousel.Item >
                            <div className="activity_carousel_image_container">
                                <img className="activity_carousel_img" src={img} alt="First slide" />
                            </div>
                        </Carousel.Item>)}

                    </Carousel>
                </Modal.Body>
            </Modal>


        </>

    );
};

function Activity() {

    TabTitle('Pranav Shekhawat - Activity');

    return (
        <>
            <Navbar />
            <BasicBreadcrumbs text="Activity" theme="dark"></BasicBreadcrumbs>
            <Headingbar heading="Activity" description="" />

            <div className='grid_container_25'>
                <div className='colstart2 colend25'>
                    <section className="activity_list">
                        {data.map((list) => {
                            return <Active key={list.index} {...list}></Active>
                        })}
                    </section>
                </div>
            </div>
        </>
    )
}


export default Activity;