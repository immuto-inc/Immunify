import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    useHistory
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

import { get_user_info, IMMUTO_URL, API_URL } from "./utils"
import immuto from "./immuto"
export const im = immuto.init(true, IMMUTO_URL);

function load_survey_response(recordID) {
    return new Promise((resolve, reject) => {
        let userPassword = window.localStorage.password
        im.download_file_for_recordID(recordID, userPassword, true)
        .then(fileInfo => {
            resolve(JSON.parse(fileInfo.data))
        })
        .catch(err => reject(err))
    })
}

function load_aggregate_responses(surveyID, authToken) {
  authToken = authToken || window.localStorage.authToken

  return new Promise((resolve, reject) => {
    let url = `${API_URL}/survey-responses?authToken=${authToken}`;
    url += "&surveyID=" + surveyID

    fetch(url, {})
    .then(res => res.json())
    .then(
      (result) => {
        resolve(result)
      },
      (err) => {
        reject(err)
      })
  })
}

function App() {
  const [authToken, setAuthToken] = useState(window.localStorage.authToken)
  const [userInfo, setUserInfo] = useState(undefined)
  const [profileInfo, setProfileInfo] = useState(undefined)
  // const [outstandingSurveys, setOutstandingSurveys] = useState([])
  const outstandingSurveys = [
    {
      title: "Daily COVID Check-in",
      type: "medical",
      sponsor: "Immunify",
      description: "A short survey for COVID-19 related symptoms",
      identifier: "COVID"
    },
    {
      title: "Daily Mood Check-in",
      type: "mental",
      sponsor: "Immunify",
      description: "A short survey for tracking your mood and mental well-being",
      identifier: "MOOD"
    }
  ]
  const [surveyResults, setSurveyResults] = useState({
    "COVID": [],
    "MOOD": []
  })
  const [aggregateResults, setAggregateResults] = useState({
    "COVID": [],
    "MOOD": []
  })

  const dashboardRoutes = [
    ''
  ]

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

  useEffect(() => { 
    if (!userInfo) return;
    if (surveyResults["MOOD"].length !== 0 || surveyResults["COVID"].length !== 0) return

    if (userInfo["COVID_transactions"] && userInfo["COVID_transactions"].length) {
        for (let recordID of userInfo["COVID_transactions"]) {
            load_survey_response(recordID)
            .then(covidResults => {
                surveyResults["COVID"].push(covidResults)
                setSurveyResults(JSON.parse(JSON.stringify(surveyResults)))
            })
            .catch(err => console.error(err))
        }
    }

    if (userInfo["MOOD_transactions"] && userInfo["MOOD_transactions"].length) {
        for (let recordID of userInfo["MOOD_transactions"]) {
            load_survey_response(recordID)
            .then(covidResults => {
                surveyResults["MOOD"].push(covidResults)
                setSurveyResults(JSON.parse(JSON.stringify(surveyResults)))
            })
            .catch(err => console.error(err))
        }
    }
  }, [userInfo, surveyResults]);

  useEffect(() => { 
    if (!authToken) return;

    if (aggregateResults["MOOD"].length === 0) {
        load_aggregate_responses("MOOD", authToken) 
        .then(responses => { 
            aggregateResults["MOOD"] = responses
            setAggregateResults(aggregateResults)
        })
        .catch(err => console.error(err))
    }
    if (aggregateResults["COVID"].length === 0) {
        load_aggregate_responses("COVID", authToken) 
        .then(responses => { 
            aggregateResults["COVID"] = responses
            setAggregateResults(aggregateResults)
        })
        .catch(err => console.error(err))
    }
  }, [aggregateResults, authToken]);

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
            <Dashboard authToken={authToken} aggregateResults={aggregateResults} profileInfo={profileInfo} outstandingSurveys={outstandingSurveys} userInfo={userInfo} surveyResults={surveyResults}/>
            </div>
        </Route> 
        <Route exact path="/surveys">
            <div>     
            <Sidebar activeLink='/surveys'/> 
            <Surveys authToken={authToken} profileInfo={profileInfo} outstandingSurveys={outstandingSurveys} userInfo={userInfo} setUserInfo={setUserInfo} surveyResults={surveyResults}/>
            </div>
        </Route> 
        <Route exact path="/surveys/:surveyID">
            <div>     
            <Sidebar activeLink='/surveys'/> 
            <Surveys authToken={authToken} profileInfo={profileInfo} userInfo={userInfo} setUserInfo={setUserInfo} surveyResults={surveyResults}/>
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
