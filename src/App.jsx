import React from 'react';
import { Route, Routes} from 'react-router-dom';
import Home from './Home';
import Projects from './Projects';
import About from './About';
import Error from './Error';
import Navbar from './Navbar';
import Footer from './Footer';
import Workpage from './Workpage';


function App (){
  
  

    return(
      <>

      <Navbar/>
      <Routes>
       
        <Route path='/' element={<Home />}/>
        <Route path='/projects' element={<Projects />}/>
        
       <Route path='/projects/:url' element={<Workpage/>}/>

       <Route path='/about' element={<About/>}/>
       <Route path="*" element={<Error/>} />

      </Routes>

      <Footer/>

      </>
    );
  };

  export default App;