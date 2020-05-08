import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    // Link,
    // Redirect
} from "react-router-dom";
import './App.css';
import './theme.scss';
import './styles/dashboard.css'

import Homepage from "./pages/homepage"
import Login from "./pages/login"
import Register from "./pages/register"

import Dashboard from "./pages/dashboard"
import Surveys from "./pages/surveys"
import Profile from "./pages/profile"
import Settings from "./pages/settings"


import Sidebar from "./components/sidebar"

function App() {
  const [authToken, setAuthToken] = useState("")

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
            <Dashboard authToken={authToken}/>
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

        </div>
        </div>
      </Switch>
    </Router>
  );
}

export default App;
