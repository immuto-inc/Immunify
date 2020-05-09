import React, { useState } from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory, useParams } from "react-router-dom"

import PageTitle from "../components/page_title"
import SurveyForm from "../components/survey_views"

const covidCheckinSurvey = {
  title: "Daily COVID Check-in",
  pointValue: 250,
  type: "medical",
  questions: [
    {
      questionText: "Select your age range",
      answers: ["18 or younger", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75 or older"],
      type: "radio"
    },
    {
      questionText: "Select your sex",
      answers: ["Male", "Female", "Other"],
      type: "radio"
    }
  ]
}

const moodCheckinSurvey = {
  title: "Daily Mood Check-in",
  pointValue: 250,
  type: "mood",
  questions: [
    {
      questionText: "Select your age range",
      answers: ["18 or younger", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75 or older"],
      type: "radio"
    },
    {
      questionText: "Select your sex",
      answers: ["Male", "Female", "Other"],
      type: "radio"
    }
  ]
}

const initialSurvey = {
  "COVID": covidCheckinSurvey,
  "MOOD": moodCheckinSurvey
}

const Surveys = ({authToken, userInfo, profileInfo}) => {
  let history = useHistory()  
  const { surveyID } = useParams()

  const [survey, setSurvey] = useState(initialSurvey[surveyID])

  authToken = authToken || window.localStorage.authToken
  if (!authToken) {history.push('/login');}

  if (!userInfo) {
    return (
      <Container fluid> 
        <PageTitle pageName="Surveys"/>        
      </Container>
    );
  }

  if (!userInfo.profileInfo) { 
    history.push('/dashboard') // to fill out onboarding form
  }

  return (
      <Container fluid> 
        <PageTitle pageName="Surveys" score={userInfo.score}/> 
        <SurveyForm questions={survey.questions}
                    title={survey.title}
                    sponsor={survey.sponsor}
                    timeEstimate={survey.timeEstimate}
                    pointValue={survey.pointValue}
                    type={survey.type}
                    handleSubmit={responses => {
                      {/*let responseString = JSON.stringify(responses)
                      let userPassword = window.localStorage.password
                      im.create_data_management(responseString, "Demographic Survey", "editable", userPassword, "")
                      .then(recordID => {
                        im.upload_file_for_record({name: "Demographic Survey", type: "text/plain"}, responseString, recordID, userPassword)
                        .then(done => {
                          store_demographics_for_user(recordID)
                          .then(success => {
                            window.location.reload()
                          })
                          .catch(err => {
                            console.error(err)
                            alert("Failed to store profile information with Immunify")
                          })
                        })  
                        .catch(err => {
                          console.error(err)
                          alert("Failed to upload encrypted response")
                        })
                      })  
                      .catch(err => {
                        console.error(err)
                        alert("Failed blockchain transaction while submitting survey: " + err)
                      })*/}
                    }}
                    />            
      </Container>
  );
}

export default Surveys;
