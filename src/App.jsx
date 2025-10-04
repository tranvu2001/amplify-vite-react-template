import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';

import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import About from "./Pages/About";


function App() {
  return <>
      
      <Routes>
        
        <Route path="/" element={<Home />} >
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        </Route>
      </Routes>

    
  </>
}

export default App;
