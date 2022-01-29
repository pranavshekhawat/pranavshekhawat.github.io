import React from 'react';
import { Route, Routes} from 'react-router-dom';
import Home from './Home';
import Projects from './Projects';
import About from './About';
import Error from './Error';
import Navbar from './Navbar';
import Footer from './Footer';
import Workpage from './Workpage';
import LoadingBar from 'react-top-loading-bar';


function App (){
  
    //  var state ={
    //    progress:0
    //  }

    //  function setProgress(progress){
    //  this.setState({progress: progress})
    //  }

    return(
      <>

      {/* <LoadingBar color='#ff5000' progress={this.state.progress} onLoaderFinished={() => setProgress(0)} /> */}
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