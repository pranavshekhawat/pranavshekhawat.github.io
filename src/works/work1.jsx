import React from "react";
import Img from "../Components/gallerygrid/Img";
import Gallerygrid from "../Components/gallerygrid/Gallerygrid";
// import Text from "../Components/pageblocks/Text";
import Btn from "../Components/pageblocks/Btn";

function Work1(){

    return(
        <>
        

        <p id="markks"> vsaadsvdsvhbv
            vddsjvsjvsjksdkjvbkjdsbmvyua djajsshyvchddsvVsdvsdvj
        </p>
        <Gallerygrid images={<>
        <Img height="40vw" src='/images/work1/workimage1.jpg' alt="test image"/>
         </>}/>
         <Btn content={<div>vghgcgcgchgc</div>} to='/about' targetblank={true} />

        <Gallerygrid images={<>
        <Img height="35vw" src='/images/work1/workimage1.jpg' alt="test image"/>
        <Img  height="35vw" src='/images/work1/workimage2.jpg' alt="test image"/>
        <p id="marks"></p>
        </>}/>
        
        </>
    )
}

export default Work1;