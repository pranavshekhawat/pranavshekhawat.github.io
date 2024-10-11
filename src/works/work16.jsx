import React from "react";
import Img from "../Components/gallerygrid/Img";


function Work16() {

    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>

                    <br /><br />
                    <br /><br />
                   
                    <span id="whatisar" className="bookmark_positioner"></span>
                    <h1>What is Augmented Reality (AR)? </h1>
                    <br></br>
                    <div className="text halffull">
                    Augmented Reality is a technology that overlays digital content, such as images or animations, onto the real world through a smartphone or other devices. Unlike virtual reality, which creates a fully digital environment, AR enhances the real-world experience by adding interactive digital elements. In our case, AR allows fabric designs to be projected onto real surfaces, giving users a realistic sense of how the fabric would look and behave in different contexts.
                    <br />This filter allows users to scan a marker printed on an A4 sheet, enabling the fabric design to be projected at its true scale and texture onto it. This ensures accurate visualization and helps users make more informed decisions when selecting fabrics.                    </div>
                    <br /><br />
                    <span id="howitworks" className="bookmark_positioner"></span>
                    <h1> How the filter works:</h1>
                    <br></br>
                    <div className="text halffull">
                    <ul>
    <li><strong>Easily Accessible:</strong> The AR filter can be integrated into any website or mobile app, allowing customers to access it with a simple click. Different filters can be tailored for various fabric products, offering flexibility in its use.</li>
    
    <li><strong>Customer-Friendly Tracker:</strong> Customers receive a printed A4-size sheet (a pamphlet) that serves as a target tracker. This sheet is the key to accurately projecting the fabric design using AR.</li>
    
    <li><strong>Seamless Interaction:</strong> To use the filter, customers open the AR tool on their device and scan the target tracker sheet. The fabric design is then projected onto the sheet in real time, allowing users to explore the pattern by moving their phone around.</li>
    
    <li><strong>Immersive Exploration:</strong> By simply adjusting their phone’s position, customers can explore different angles and perspectives of the fabric design, experiencing how it would look in real-world scenarios, such as on garments or home décor.</li>
</ul>

                
                                       </div>
                    <br /><br />
                    <span id="demoimages" className="bookmark_positioner"></span>
                    <div className="overflowhidden  noflexinphone">
                        <Img height="auto" src='\images\works\ar\b1.jpg' alt="documant page 1" />
                        <Img height="auto" src='\images\works\ar\b2.jpg' alt="documant page 2" />
                        <Img height="auto" src='\images\works\ar\b3.jpg' alt="documant page 3" />
                    </div><br />
                    
                
                    <div className="overflowhidden  noflexinphone">
                    <Img height="auto" src='\images\works\ar\b4.jpg' alt="documant page 4" />
                        <Img height="auto" src='\images\works\ar\b5.jpg' alt="documant page 5" />
                        <Img height="auto" src='\images\works\ar\b6.jpg' alt="documant page 6" />
                    </div><br />
                   <br />
                    <br /><br /><br />

                </div>
            </div>


        </>
    )
}

export default Work16;