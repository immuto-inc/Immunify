import React from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"
import SurveyForm from "../components/survey_views"


const oboardingQuestions = [
  {
    questionText: "Select your age range",
    answers: ["18 or younger", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75 or older"],
    type: "radio"
  },
  {
    questionText: "Select any countries you've visited in the past 14 days:",
    answers: ["Italy", "China", "USA", "Brazil", "Germany"],
    type: "radio"
  },
]

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
        <SurveyForm questions={oboardingQuestions}/>      
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
