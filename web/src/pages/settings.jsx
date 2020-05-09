import React from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"

const Settings = ({authToken, userInfo}) => {
  let history = useHistory()  

  authToken = authToken || window.localStorage.authToken
  if (!authToken) {history.push('/login');}
  
  if (!userInfo) {
    return (
      <Container fluid> 
        <PageTitle pageName="Settings"/>        
      </Container>
    );
  }

  if (!userInfo.profileInfo) { 
    history.push('/dashboard') // to fill out onboarding form
  }
  return (
      <Container fluid> 
        <PageTitle pageName="Settings"/>        
      </Container>
  );
}

export default Settings;
