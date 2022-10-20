import React from "react";
import Img from "../Components/gallerygrid/Img";
import Gallerygrid from "../Components/gallerygrid/Gallerygrid";
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
                    <span id="final_collection" className="bookmark_positioner"></span>
                    <h1>Final Collection</h1>
                    <br></br>

                    <Gallerygrid images={<>
                        <Img height="auto" src='/images/works/digital_nature/68.jpeg' alt="Pranav Shekhawat | Print Design | Digital Nature " />
                        <Img height="auto" src='/images/works/digital_nature/69.jpeg' alt="Pranav Shekhawat | Print Design | Digital Nature " />
                    </>} />
                    <br /><br />
                    <br /><br />


                </div>

            </div>



        </>
    )
}

export default Work7;