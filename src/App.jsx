import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';

import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import ListUser from "./Pages/User/ListUser";
import UserDetail from "./Pages/User/UserDetail";
import ListProperties from "./Pages/Property/ListProperties";
import PropertyDetail from "./Pages/Property/PropertyDetail";




function App() {
  
  return <>
      
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/contact" element={<Contact />}/>
        <Route path="/list-user" element={<ListUser />}/>
        <Route path="/list-user/:userId" element={<UserDetail />}/>
        <Route path="/list-properties" element={<ListProperties />}/>
        <Route path="/list-properties/:propertyId" element={<PropertyDetail />}/>
      </Routes>

    
  </>
}

export default App;
