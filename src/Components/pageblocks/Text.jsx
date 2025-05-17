<<<<<<< HEAD
import React from 'react';

function Text({ content, i }) {

    if (i === true) {
        var code = <>

            <div className='text'>
                <em>{content}</em>
            </div>

        </>
    }
    else {
        code = <>

            <div className='text'>
                {content}
            </div>

        </>
    }

    return (code);
    // the css for class text is in index.css
}

=======
import React from 'react';

function Text({ content, i }) {

    if (i === true) {
        var code = <>

            <div className='text'>
                <em>{content}</em>
            </div>

        </>
    }
    else {
        code = <>

            <div className='text'>
                {content}
            </div>

        </>
    }

    return (code);
    // the css for class text is in index.css
}

>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default Text;