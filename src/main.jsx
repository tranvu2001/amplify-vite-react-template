import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
// import "./index.css";
import "./GlobalCSS/basecss.css";
import '@aws-amplify/ui-react/styles.css';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([ AllCommunityModule ]);
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <Authenticator> */}
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    {/* </Authenticator>   */}
  </React.StrictMode>
);
