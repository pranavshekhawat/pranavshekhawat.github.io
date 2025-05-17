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

export default Text;