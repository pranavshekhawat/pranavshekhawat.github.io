import React from 'react';
import './bookmarkbar.css';

function Bookmarkbar({bookmarks}){
return(
    <>
    <div className="bookmarkbar">
     <div className="bookmarkmain">
        <div className="bookmarkitem">
          {bookmarks}
          </div>
       </div>
       </div>
    </>
)
}

export default Bookmarkbar;