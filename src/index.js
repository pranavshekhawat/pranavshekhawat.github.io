import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';
import './css/fonts.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import ScrollToTop from './Components/ScrollToTop';

ReactDOM.render( <BrowserRouter> <ScrollToTop/><App/></BrowserRouter> , document.getElementById('root') );
