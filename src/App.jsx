import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Home';
// import Projects from './Projects';
// import About from './About';
// import Activity from './Activity'
import Error from './Error';
import Footer from './Footer';
import Workpage from './Workpage';
import Lifestyle from './Lifestyle';
import Aceturtle from './Aceturtle';

import ReactGA from 'react-ga';

const TRACKING_ID = "G-Z18T1FYYYD"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);

function App() {

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <>

      <Routes>

        <Route path='/' element={<Home />} />
        {/* <Route path='/work' element={<Projects />}/> */}

        <Route path='/projects/:url' element={<Workpage />} />  

        <Route path='/projects/lifestyle' element={<Lifestyle />} />
        <Route path='/projects/ace_turtle' element={<Aceturtle />} />  

        {/* <Route path='/activity' element={<Activity/>}/> */}

        {/* <Route path='/about' element={<About/>}/> */}

        {/* <Route path="/thetextilelibrary/*" element={<Navigate to="/thetextilelibrary" replace />} /> */}



        <Route path="*" element={<Error />} />
    


      </Routes>

      <Footer />

    </>
  );
};

export default App;