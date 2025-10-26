import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
// import "./index.css";
import "./GlobalCSS/basecss.css";

import '@aws-amplify/ui-react/styles.css';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'


const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_3ToXzXlfr",
  client_id: "3kuimt6jmmqq66rs339klfrra1",
  redirect_uri: "http://localhost:5173/",
  response_type: "code",
  scope: "email openid phone",
};

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    
      
        <BrowserRouter>
          <App />
        </BrowserRouter>
    
   
  </React.StrictMode>
);
