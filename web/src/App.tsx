import { createMuiTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import Dashboard from "./components/dashboard";
import Homepage from "./components/homepage";
import Login from "./components/login";
import Register from "./components/register";
import ResearcherForm from './components/researcherForm/ResearcherForm';



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
          <Route exact path="/createForm">
            {() => <ResearcherForm authToken={authToken} />}
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
