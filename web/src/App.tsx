import { createMuiTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import Dashboard from "./components/dashboard";
import Homepage from "./components/homepage";
import Login from "./components/login";
import Register from "./components/register";
import BroseForms from './components/researcherForm/BrowseForms';
import CreateForm from './components/researcherForm/CreateForm';
import MultipleChoice from './components/researcherForm/MultipleChoice';
import ResearcherForm from './components/researcherForm/ResearcherForm';
import ResearcherPortal from './components/researcherForm/ResearcherPortal';
import Responses from './components/researcherForm/Responses';
import UserForm from './components/researcherForm/UserForm';



let theme = createMuiTheme({
  palette: {
    primary: { light: "#000000", main: "#000000", dark: "#000000" },
    secondary: { light: "#ffffff", main: "#ffffff", dark: "#ffffff" }
  }
});
theme = responsiveFontSizes(theme);

function App() {
  const [authToken, setAuthToken] = useState("")

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/">
            {() => <Homepage />}
          </Route>
          <Route exact path="/login">
            {() => <Login setAuthToken={setAuthToken} />}
          </Route>
          <Route exact path="/register">
            {() => <Register />}
          </Route>
          <Route exact path="/dashboard">
            {() => <Dashboard authToken={authToken} />}
          </Route>


          <Route exact path="/researcherform/new">
            {() => <CreateForm authToken={authToken} />}
          </Route>
          <Route exact path="/researcherform/add/:formId">
            {(props) => <ResearcherForm {...props} authToken={authToken} />}
          </Route>
          <Route exact path="/researcherform/responses/:formId">
            {(props) => <Responses {...props} authToken={authToken} />}
          </Route>
          <Route exact path="/researcherform/userview/:formId">
            {(props) => <UserForm {...props} authToken={authToken} />}
          </Route>
          <Route exact path="/browse">
            {() => <BroseForms authToken={authToken} />}
          </Route>
          <Route exact path="/researcher/portal">
            {() => <ResearcherPortal authToken={authToken} />}
          </Route>
          <Route exact path="/researcherform/add/multiplechoice">
            {(props) => <MultipleChoice {...props} authToken={authToken} />}
          </Route>

        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
