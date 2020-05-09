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
    questionText: "Select your sex",
    answers: ["Male", "Female", "Other"],
    type: "radio"
  },
  {
    questionText: "Enter your ZIP code (or 'NA' for Non-USA)",
    type: "text",
    inputProps: {
      placeholder: "ZIP code",
      message: "Your location is kept completely private by default",
      validator: (input) => {
        try {
          // handle leading 0 cases
          let exceptions = ["na", 'n']
          if (exceptions.includes(input.toLowerCase())) return input
          for (let e of exceptions) {
            if (input.toLowerCase().startsWith(e)) return input.substring(0, e.length);
          }

          let parsed = parseInt(input.substring(0,5), 10)
          if (parsed) return parsed
          return ""
        } catch(err) {
          return ""
        }
      }
    }
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
        <SurveyForm questions={oboardingQuestions}
                    timeEstimate="1"
                    pointValue="100"
                    handleSubmit={responses => {
                      console.log(responses)
                    }}
                    />      
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
