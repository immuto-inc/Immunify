import React from 'react';
import logo from './logo.svg';
import './App.css';

import { Button } from '@material-ui/core';
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

let theme = createMuiTheme({
  palette: {
    primary: { light: "#ffffaa", main: "#ffffaa", dark: "#ffffaa" }
  }
});
theme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Button color="primary">
          Edit <code>src/App.js</code> and save to reload.
        </Button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
    </ThemeProvider>
  );
}

export default App;
