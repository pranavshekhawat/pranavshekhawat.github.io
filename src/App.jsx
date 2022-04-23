import React from 'react';
import { Route, Routes} from 'react-router-dom';
import Home from './Home';
import Projects from './Projects';
import About from './About';
// import Activity from './Activity'
import Error from './Error';
import Footer from './Footer';
import Workpage from './Workpage';


function App (){
  
  

    return(
      <>

      <Routes>
       
        <Route path='/' element={<Home />}/>
        <Route path='/works' element={<Projects />}/>
        
       <Route path='/works/:url' element={<Workpage/>}/>

       {/* <Route path='/activity' element={<Activity/>}/> */}

       <Route path='/about' element={<About/>}/>
       <Route path="*" element={<Error/>} />

      </Routes>

      <Footer/>

      </>
    );
  };

  export default App;