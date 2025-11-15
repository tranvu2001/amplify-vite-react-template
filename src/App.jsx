import { useEffect, useState } from "react";


import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import ListUser from "./Pages/User/ListUser";
import UserDetail from "./Pages/User/UserDetail";
import ListProperties from "./Pages/Property/ListProperties";
import PropertyDetail from "./Pages/Property/PropertyDetailV2";
import RptRevenue from "./Pages/Report/RptRevenue";
import PropertyPortfolioMap from "./Pages/Map/PropertyPortfolioMap";
import PropertyDetailMap from "./Pages/Map/PropertyDetailMap";


import { Amplify } from "aws-amplify";

import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import Header from "./Components/Header/Header";
import Dashboard from "./Pages/Dashboard/Dashboard";
import ListTransaction from "./Pages/Transaction/ListTransaction";
import Profile from "./Pages/User/Profile";
import UserDetailV2 from "./Pages/User/UserDetailV2";
// import Profilev2 from "./Pages/User/Profilev2";


// Amplify.configure({
//   aws_project_region: 'ap-southeast-1',
//   aws_cognito_region: 'ap-southeast-1',
//   aws_user_pools_id: 'ap-southeast-1_3ToXzXlfr',
//   aws_user_pools_web_client_id: '3kuimt6jmmqq66rs339klfrra1',
//   aws_mandatory_sign_in: "enable",
// });

Amplify.configure({
  aws_project_region: 'ap-southeast-1',
  aws_cognito_region: 'ap-southeast-1',
  aws_user_pools_id: 'ap-southeast-1_vAatbR9aq',
  aws_user_pools_web_client_id: '1ia8t60g5olkl93d2jrbt3p7h9',
  aws_mandatory_sign_in: "enable",
});


function App() {
  const [user, setUser] = useState(null);

  const userAttributes = () => {
    fetchUserAttributes().then(attributes => {
      console.log('Full user attributes:', attributes);
      // Ví dụ: attributes.email, attributes.name, attributes.birthdate, ...
    });

    fetchAuthSession().then(session => {
      console.log('Full user session:', session);
      // Trả về token, thời gian hết hạn, v.v.
    });


  }

  return <>
    <Header />

    <Authenticator loginMechanisms={['email']}
      signUpAttributes={[

        'birthdate',
        'email',
        'name',
        'phone_number',
      ]}
      socialProviders={['amazon', 'apple', 'facebook', 'google']}
    >

      {({ signOut, user }) => (
        <>
        <main>
          <h1>Hello {user?.name}</h1>
          <button onClick={signOut}>Sign out</button>
          <button onClick={userAttributes}>Get User Attributes</button>
        </main>
        
        </>
      )}

      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Dashboard />} >
          <Route index element={<ListUser />} />
          <Route path="/list-user" element={<ListUser />} />
          {/* <Route path="/list-user/:userId" element={<UserDetail />} /> */}
          <Route path="/list-user/:userId" element={<UserDetailV2 />} />
          <Route path="/list-properties" element={<ListProperties />} />
          <Route path="/list-properties/:propertyId" element={<PropertyDetail />} />
          <Route path="/report-revenue" element={<RptRevenue />} />
          <Route path="/map-property-portfolio" element={<PropertyPortfolioMap />} />
          <Route path="/profile" element={<Profile/>} />
          {/* <Route path="/profilev2" element={<Profilev2/>} /> */}
          {/* <Route path="/map-property-detail" element={<PropertyDetailMap />} /> */}
          {/* <Route path="/list-transaction" element={<ListTransaction />} />
          <Route path="/list-transaction/:transactionId" element={<ListTransaction />} /> */}
        </Route>

      </Routes>

    </Authenticator>
  </>
}

export default App;
