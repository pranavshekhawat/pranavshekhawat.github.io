import Work1 from './works/work1';
import Work2 from './works/work2';
import { NavHashLink } from 'react-router-hash-link';

export const data = [
    { 
        id:1,
        img:"/images/work1/workimage1.jpg",
        title:"Cardolly",
        category:"weave design",
        topimg:"/images/work1/workimage1.jpg",
        bottomimg:"/images/work1/workimage2.jpg",
        description:"ngcghchjhv,jhjhgcgchjgy jy, fkm  m hd  cgh cc cyugil fj,j",
        body:<Work1/>,
        bookmarks:<>
        <NavHashLink smooth to="#marks" activeClassName="active">Link to Hash Fragment</NavHashLink>
        <NavHashLink smooth to="#markks" activeClassName="active">Link to Hash Fragment</NavHashLink>
        </>
    },
    {
        id:2,
        img:"/images/work1/workimage2.jpg",
        title:"Car dolly",
        category:"Print design",
        topimg:"/images/work1/workimage2.jpg",
        bottomimg:"/images/work1/workimage1.jpg",
        description:"ngcgh,vgmfy  fy  ,vvg vgkcu ckc cfykktdy  gcgkcgh k ctkc gkchjj",
        body:<Work2/>,
        bookmarks:<>
        <NavHashLink smooth to="#marks" activeClassName="active">Link to Hash</NavHashLink>
        <NavHashLink smooth to="#markks" activeClassName="active">Link to Hash</NavHashLink>
        </>
    },
    {
        id:3,
        img:"/images/work1/workimage2.jpg",
        title:"Caolly",
        category:"Print design",
        topimg:"/images/work1/workimage2.jpg",
        bottomimg:"/images/work1/workimage1.jpg",
        description:"ngcgh,vgmfy  fy  ,vvg vgkcu ckc cfykktdy  gcgkcgh k ctkc gkchjj",
        body:<Work2/>,
        bookmarks:<>
        <NavHashLink smooth to="#marks" activeClassName="active">Link to Hash</NavHashLink>
        <NavHashLink smooth to="#markks" activeClassName="active">Link to Hash</NavHashLink>
         </>
    },
    {
        id:2,
        img:"/images/work1/workimage2.jpg",
        title:"Car dolly",
        category:"Print design",
        topimg:"/images/work1/workimage2.jpg",
        bottomimg:"/images/work1/workimage1.jpg",
        description:"ngcgh,vgmfy  fy  ,vvg vgkcu ckc cfykktdy  gcgkcgh k ctkc gkchjj",
        body:<Work2/>,
        bookmarks:<>
        <NavHashLink smooth to="#marks" activeClassName="active">Link to Hash</NavHashLink>
        <NavHashLink smooth to="#markks" activeClassName="active">Link to Hash</NavHashLink>
         </>
    }
]