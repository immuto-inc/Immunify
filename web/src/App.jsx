import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    // Link,
    // Redirect
} from "react-router-dom";
import './theme.scss'; // includes bootstrap
import './styles/dashboard.css' // for sidebar formatting mostly

import Homepage from "./pages/homepage"
import Login from "./pages/login"
import Register from "./pages/register"

import Dashboard from "./pages/dashboard"
import Surveys from "./pages/surveys"
import Profile from "./pages/profile"
import Settings from "./pages/settings"
import Logout from "./pages/logout"


import Sidebar from "./components/sidebar"

import { get_user_info } from "./utils"

function App() {
  const [authToken, setAuthToken] = useState(window.localStorage.authToken)
  const [userInfo, setUserInfo] = useState(undefined)

  useEffect(() => { 
    if (!authToken || userInfo) return;

    get_user_info(authToken) 
    .then(uInfo => setUserInfo(uInfo))
    .catch(err => console.error(err))
  }, [authToken, userInfo]);

  return (
    <Router>
      <Switch>
        <Route exact path="/">
            {() => <Homepage/>}
        </Route>     
        <Route exact path="/login">
            {() => <Login setAuthToken={setAuthToken}/>}
        </Route> 
        <Route exact path="/register">
            {() => <Register/>}
        </Route> 

        <div id="content-wrapper">
        <div id="main">

        <Route exact path="/dashboard">
            <div>     
            <Sidebar activeLink='/dashboard'/> 
            <Dashboard authToken={authToken} userInfo={userInfo} setUserInfo={setUserInfo}/>
            </div>
        </Route> 
        <Route exact path="/surveys">
            <div>     
            <Sidebar activeLink='/surveys'/> 
            <Surveys authToken={authToken}/>
            </div>
        </Route> 
        <Route exact path="/profile">
            <div>     
            <Sidebar activeLink='/profile'/> 
            <Profile authToken={authToken}/>
            </div>
        </Route> 
        <Route exact path="/settings">
            <div>     
            <Sidebar activeLink='/settings'/> 
            <Settings authToken={authToken}/>
            </div>
        </Route> 


        <Route exact path="/logout">
            <div>     
            <Sidebar activeLink='/logout'/> 
            <Logout authToken={authToken}/>
            </div>
        </Route> 
        </div>
        </div>
      </Switch>
    </Router>
  );
}

export default App;
