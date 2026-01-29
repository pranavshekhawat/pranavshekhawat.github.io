import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
// import AdminRoute from './AdminRoute';
import Lab from './lab';
import Home from './Home';
// import Projects from './Projects';
// import About from './About';
// import Activity from './Activity'
import Error from './Error';
import Workpage from './Workpage';
import Lifestyle from './Lifestyle';
import Aceturtle from './Aceturtle';
import Freeman from './Freeman';
import ReactGA from 'react-ga';
import Inventory from './labcomponents/Inventory';
import RecipesPage from './labcomponents/RecipesPage';
import GeneratorPage from './labcomponents/GeneratorPage';
import PrintCenter from './labcomponents/PrintCenter';
import BatchesPage from './labcomponents/BatchesPage';
import CalendarPage from './labcomponents/CalendarPage';
import RecipeTemplates from './labcomponents/RecipeTemplates';
import SalesDashboard from './labcomponents/SalesDashboard';
import LabelGenerator from './labcomponents/LabelGenerator';
import LabDashboard from './labcomponents/LabDashboard';
import DataBackup from './labcomponents/DataBackup';
import UsageReports from './labcomponents/UsageReports';
import Notifications from './labcomponents/Notifications';
import LabNotes from './labcomponents/LabNotes';
import QuickBatch from './labcomponents/QuickBatch';
// import RecipeFinder from './labcomponents/RecipeFinder'; // Merged into Recipes page
// import PackagingDesigner from './labcomponents/PackagingDesigner'; // Disabled - use Canva/Illustrator for packaging design

// import ProtectedRoute from './Components/ProtectedRoute';
// import Portfolioold from './Portfolioold';
// import Portfolio from './Portfolio';
// import PlayArea from './PlayArea';

const TRACKING_ID = "G-Z18T1FYYYD"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);

function App() {

  const location = useLocation();

  useEffect(() => {
    // scroll to top on route change and send GA pageview
    window.scrollTo(0, 0);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [location]);

  return (
    // make the route area independently scrollable
    <main style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <Routes>

        <Route path='/' element={<Home />} />
        {/* <Route path='/work' element={<Projects />}/> */}

        <Route path='/projects/:url' element={<Workpage />} />  

        <Route path='/projects/lifestyle' element={<Lifestyle />} />
        <Route path='/projects/ace_turtle' element={<Aceturtle />} />  

        {/* <Route path='/activity' element={<Activity/>}/> */}

        {/* <Route path='/about' element={<About/>}/> */}

         <Route path='/freeman' element={<Freeman/>}/>

        {/* <Route path='/portfolio' element={<Portfolio/>}/> */}
        {/* <Route path='/portfolio' element={<Portfolioold/>}/> */}

        {/* Lab routes */}
        <Route path='/lab' element={<Lab/>} />
        <Route path='/lab/inventory' element={<Inventory/>} />
        <Route path='/lab/recipes' element={<RecipesPage/>} />
        <Route path='/lab/generator' element={<GeneratorPage/>} />
        <Route path='/lab/print' element={<PrintCenter/>} />
        <Route path='/lab/batches' element={<BatchesPage/>} />
        <Route path='/lab/calendar' element={<CalendarPage/>} />
        <Route path='/lab/templates' element={<RecipeTemplates/>} />
        <Route path='/lab/sales' element={<SalesDashboard/>} />
        <Route path='/lab/labels' element={<LabelGenerator/>} />
        <Route path='/lab/dashboard' element={<LabDashboard/>} />
        <Route path='/lab/backup' element={<DataBackup/>} />
        <Route path='/lab/reports' element={<UsageReports/>} />
        <Route path='/lab/notifications' element={<Notifications/>} />
        <Route path='/lab/notes' element={<LabNotes/>} />
        <Route path='/lab/quickbatch' element={<QuickBatch/>} />
        {/* <Route path='/lab/finder' element={<RecipeFinder/>} /> */}
        {/* <Route path='/lab/packaging' element={<PackagingDesigner/>} /> */}

        {/* <Route path='/portfolio/play' element={<PlayArea/>}/> */}

        {/* <Route path="/thetextilelibrary/*" element={<Navigate to="/thetextilelibrary" replace />} /> */}

        <Route path="*" element={<Error />} />

      </Routes>
    </main>
  );
};

export default App;