import React, { useEffect, useMemo } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
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
import PricingPage from './labcomponents/PricingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// import RecipeFinder from './labcomponents/RecipeFinder'; // Merged into Recipes page
// import PackagingDesigner from './labcomponents/PackagingDesigner'; // Disabled - use Canva/Illustrator for packaging design

// import Portfolioold from './Portfolioold';
// import Portfolio from './Portfolio';
// import PlayArea from './PlayArea';

const TRACKING_ID = "G-Z18T1FYYYD"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);

// Soap Lab domain - soaplab.in
const SOAP_LAB_DOMAINS = [
  'soaplab.in',
  'www.soaplab.in',
];

function App() {

  const location = useLocation();
  
  // Detect if we're on the Soap Lab domain
  const isSoapLabDomain = useMemo(() => {
    const hostname = window.location.hostname;
    return SOAP_LAB_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }, []);

  useEffect(() => {
    // scroll to top on route change and send GA pageview
    window.scrollTo(0, 0);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [location]);

  // If on Soap Lab domain, show only Soap Lab routes
  if (isSoapLabDomain) {
    return (
      <AuthProvider>
        <main style={{ minHeight: '100vh', overflowY: 'auto' }}>
          <Routes>
            {/* Soap Lab domain routes - / becomes the lab */}
            <Route path='/' element={<Navigate to="/lab" replace />} />
            <Route path='/login' element={<LoginPage/>} />
            <Route path='/signup' element={<SignupPage/>} />
            <Route path='/pricing' element={<PricingPage/>} />
            
            {/* Lab routes (protected) */}
            <Route path='/lab' element={<ProtectedRoute><Lab/></ProtectedRoute>} />
            <Route path='/lab/inventory' element={<ProtectedRoute><Inventory/></ProtectedRoute>} />
            <Route path='/lab/recipes' element={<ProtectedRoute><RecipesPage/></ProtectedRoute>} />
            <Route path='/lab/generator' element={<ProtectedRoute><GeneratorPage/></ProtectedRoute>} />
            <Route path='/lab/print' element={<ProtectedRoute><PrintCenter/></ProtectedRoute>} />
            <Route path='/lab/batches' element={<ProtectedRoute><BatchesPage/></ProtectedRoute>} />
            <Route path='/lab/calendar' element={<ProtectedRoute><CalendarPage/></ProtectedRoute>} />
            <Route path='/lab/templates' element={<ProtectedRoute><RecipeTemplates/></ProtectedRoute>} />
            <Route path='/lab/sales' element={<ProtectedRoute><SalesDashboard/></ProtectedRoute>} />
            <Route path='/lab/labels' element={<ProtectedRoute><LabelGenerator/></ProtectedRoute>} />
            <Route path='/lab/dashboard' element={<ProtectedRoute><LabDashboard/></ProtectedRoute>} />
            <Route path='/lab/backup' element={<ProtectedRoute><DataBackup/></ProtectedRoute>} />
            <Route path='/lab/reports' element={<ProtectedRoute><UsageReports/></ProtectedRoute>} />
            <Route path='/lab/notifications' element={<ProtectedRoute><Notifications/></ProtectedRoute>} />
            <Route path='/lab/notes' element={<ProtectedRoute><LabNotes/></ProtectedRoute>} />
            <Route path='/lab/quickbatch' element={<ProtectedRoute><QuickBatch/></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/lab" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    );
  }

  // Default: Portfolio site (pranavshekhawat.github.io)
  return (
    <AuthProvider>
      {/* make the route area independently scrollable */}
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

          {/* Auth routes */}
          <Route path='/login' element={<LoginPage/>} />
          <Route path='/signup' element={<SignupPage/>} />
          <Route path='/pricing' element={<PricingPage/>} />

          {/* Protected Lab routes - Require authentication */}
          <Route path='/lab' element={<ProtectedRoute><Lab/></ProtectedRoute>} />
          <Route path='/lab/inventory' element={<ProtectedRoute><Inventory/></ProtectedRoute>} />
          <Route path='/lab/recipes' element={<ProtectedRoute><RecipesPage/></ProtectedRoute>} />
          <Route path='/lab/generator' element={<ProtectedRoute><GeneratorPage/></ProtectedRoute>} />
          <Route path='/lab/print' element={<ProtectedRoute><PrintCenter/></ProtectedRoute>} />
          <Route path='/lab/batches' element={<ProtectedRoute><BatchesPage/></ProtectedRoute>} />
          <Route path='/lab/calendar' element={<ProtectedRoute><CalendarPage/></ProtectedRoute>} />
          <Route path='/lab/templates' element={<ProtectedRoute><RecipeTemplates/></ProtectedRoute>} />
          <Route path='/lab/sales' element={<ProtectedRoute><SalesDashboard/></ProtectedRoute>} />
          <Route path='/lab/labels' element={<ProtectedRoute><LabelGenerator/></ProtectedRoute>} />
          <Route path='/lab/dashboard' element={<ProtectedRoute><LabDashboard/></ProtectedRoute>} />
          <Route path='/lab/backup' element={<ProtectedRoute><DataBackup/></ProtectedRoute>} />
          <Route path='/lab/reports' element={<ProtectedRoute><UsageReports/></ProtectedRoute>} />
          <Route path='/lab/notifications' element={<ProtectedRoute><Notifications/></ProtectedRoute>} />
          <Route path='/lab/notes' element={<ProtectedRoute><LabNotes/></ProtectedRoute>} />
          <Route path='/lab/quickbatch' element={<ProtectedRoute><QuickBatch/></ProtectedRoute>} />
          {/* <Route path='/lab/finder' element={<RecipeFinder/>} /> */}
          {/* <Route path='/lab/packaging' element={<PackagingDesigner/>} /> */}

          {/* <Route path='/portfolio/play' element={<PlayArea/>}/> */}

          {/* <Route path="/thetextilelibrary/*" element={<Navigate to="/thetextilelibrary" replace />} /> */}

          <Route path="*" element={<Error />} />

        </Routes>
      </main>
    </AuthProvider>
  );
};

export default App;