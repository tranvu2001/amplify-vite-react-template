import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator, ThemeProvider, defaultTheme } from '@aws-amplify/ui-react';
import App from "./App.jsx";
// import "./index.css";
import "./GlobalCSS/basecss.css";
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 


Amplify.configure(outputs);
ModuleRegistry.registerModules([AllCommunityModule]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <Authenticator> */}
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    {/* </Authenticator>   */}
  </React.StrictMode>
);
