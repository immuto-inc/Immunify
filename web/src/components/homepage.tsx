import React from "react";
import { Button } from '@material-ui/core';

import logo from '../logo.svg';

const Homepage = ({test, test2} : {test : string, test2? : string}) => (
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
);

export default Homepage;