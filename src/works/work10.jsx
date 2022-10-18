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
                    <span id="brand" className="bookmark_positioner"></span>
                    <h1>Brand</h1>
                    <br></br>
                    <div className="text">
                        Selected "Givenchy" and studied the brand and their last two years' print collections.
                    </div>
                    <br /><br />
                

                    <Gallerygrid images={<>
                        <Img height="auto" src='/images/works/digital_nature/60.jpeg' alt="Pranav Shekhawat | Print Design | Digital Nature " />
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