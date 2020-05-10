import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    // Link,
    // Redirect
} from "react-router-dom";

import Homepage from "./pages/homepage"
import Login from "./pages/login"
import Register from "./pages/register"

import Dashboard from "./pages/dashboard"
import Surveys from "./pages/surveys"
import Profile from "./pages/profile"
import Settings from "./pages/settings"
import Logout from "./pages/logout"

import Sidebar from "./components/sidebar"

import './theme.scss'; // includes bootstrap
import './styles/dashboard.css' // for sidebar formatting mostly

import { get_user_info, IMMUTO_URL } from "./utils"
import immuto from "./immuto"
export const im = immuto.init(true, IMMUTO_URL);

function App() {
  const [authToken, setAuthToken] = useState(window.localStorage.authToken)
  const [userInfo, setUserInfo] = useState(undefined)
  const [profileInfo, setProfileInfo] = useState(undefined)
  const [outstandingSurveys, setOutstandingSurveys] = useState([
    {
      title: "Daily COVID Check-in",
      type: "medical",
      sponsor: "Immunify",
      description: "A short survey for COVID-19 related symptoms",
      _id: "COVID"
    },
    {
      title: "Daily Mood Check-in",
      type: "mental",
      sponsor: "Immunify",
      description: "A short survey for tracking your mood and mental well-being",
      _id: "MOOD"
    }
  ])

  useEffect(() => { 
    if (!authToken || userInfo) return;

    get_user_info(authToken) 
    .then(uInfo => { 
        setUserInfo(uInfo) 
        if (uInfo.profileInfo) {
            let profileRecordID = uInfo.profileInfo
            let userPassword = window.localStorage.password
            im.download_file_for_recordID(profileRecordID, userPassword, true)
            .then((fileInfo) => {
                let demographicData = JSON.parse(fileInfo.data)
                setProfileInfo(demographicData)
            })
            .catch(err => console.error(err))
        }
    })
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
            <Dashboard authToken={authToken} profileInfo={profileInfo} outstandingSurveys={outstandingSurveys} userInfo={userInfo}/>
            </div>
        </Route> 
        <Route exact path="/surveys">
            <div>     
            <Sidebar activeLink='/surveys'/> 
            <Surveys authToken={authToken} profileInfo={profileInfo} outstandingSurveys={outstandingSurveys} userInfo={userInfo} setUserInfo={setUserInfo}/>
            </div>
        </Route> 
        <Route exact path="/surveys/:surveyID">
            <div>     
            <Sidebar activeLink='/surveys'/> 
            <Surveys authToken={authToken} profileInfo={profileInfo} userInfo={userInfo} setUserInfo={setUserInfo}/>
            </div>
        </Route> 
        <Route exact path="/profile">
            <div>     
            <Sidebar activeLink='/profile'/> 
            <Profile authToken={authToken} profileInfo={profileInfo} userInfo={userInfo}/>
            </div>
        </Route> 
        <Route exact path="/settings">
            <div>     
            <Sidebar activeLink='/settings'/> 
            <Settings authToken={authToken} profileInfo={profileInfo} userInfo={userInfo}/>
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
