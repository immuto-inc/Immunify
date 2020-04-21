import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
    Redirect
} from "react-router-dom";
import './App.css';

import { Button } from '@material-ui/core';
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

import Homepage from "./components/homepage"
import Login from "./components/login"
import Register from "./components/register"

let theme = createMuiTheme({
  palette: {
    primary: { light: "#000000", main: "#000000", dark: "#000000" }
  }
});
theme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <Switch>
        <Route exact path="/">
            {() => <Homepage test="test"/>}
        </Route>     
        <Route exact path="/login">
            {() => <Login/>}
        </Route> 
        <Route exact path="/register">
            {() => <Register/>}
        </Route> 
      </Switch>
    </Router>
    </ThemeProvider>
  );
}

export default App;
