import React from 'react';
import { useState } from 'react';
import './css/contact.css';

function Contact() {

    const [isHovering, setisHovering] = useState(false);

    function fillcolour() {
        return `arrow_right ${isHovering ? "fillcolor" : "fillwhite"} `
    }

    return (
        <>
            <div className='contact_main grid_container_25'>
                <div className='contact_items'>
                    {/* <div className='contact_title'>Contact Me</div> */}

                    <div className='contact_text' onMouseEnter={() => setisHovering(true)} onMouseLeave={() => setisHovering(false)}>
                        <span href='mailto:pranavshekhawat.nift@gmail.com' style={{cursor:"pointer"}}>
                            <div className={isHovering ? "changecolor" : "makewhite"}>Write me an email and consider visiting my social media handels.
                            </div>
                            <svg className={fillcolour()} viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"></path>
                            </svg>
                            <div className={isHovering ? "emailbtnafter" : "emailbtnbefore"}>E-mail
                            </div>
                        </span>
                        <br />
                        {window.innerWidth < 768 && <br /> }
                        <abbr title="Telephone number"> Tel: +91-9460636040 </abbr> &nbsp; {window.innerWidth > 768 && '|' } &nbsp;  {window.innerWidth < 768 && <br /> }{window.innerWidth > 768 && 'Email:' } pranavshekhawat.nift@gmail.com, pranavshekhawat2@gmail.com
                    </div>

                </div>
            </div>
        </>

    )
}

export default Contact;