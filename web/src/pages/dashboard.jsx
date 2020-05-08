import React from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"
import SurveyForm from "../components/survey_views"

const Dashboard = ({authToken, userInfo}) => {
  let history = useHistory()  

  authToken = authToken || window.localStorage.authToken
  if (!authToken) {history.push('/login');}

  if (!userInfo) {
    return (
      <Container fluid> 
        <PageTitle pageName="Dashboard"/>        
      </Container>
    );
  }

  if (!userInfo.profileInfo) { // return onboarding survey
    return (
      <Container fluid> 
        <PageTitle pageName="Dashboard"/>        
        <SurveyForm formContent="blah blah blah"/>      
      </Container>
    );
  }
  
  return (
    <Container fluid> 
      <PageTitle pageName="Dashboard"/>        
    </Container>
  );
}

export default Dashboard;
