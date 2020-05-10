import React, { useState } from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory, useParams } from "react-router-dom"

import PageTitle from "../components/page_title"
import SurveyForm, { NewSurveysView } from "../components/survey_views"

import { API_URL, IMMUTO_URL, today_as_string } from "../utils";
import immuto from "../immuto"
export const im = immuto.init(true, IMMUTO_URL);

const covidCheckinSurvey = {
  title: "Daily COVID Check-in",
  pointValue: 250,
  type: "medical",
  questions: [
    {
      questionText: "Select any symptoms you've experienced within the last 24h",
      answers: ["Coughing",
                "Fever",
                "Loss of taste or smell",
                "Muscle aches",
                "Shortness of breath",

      ],
      type: "checkbox"
    },
    {
      questionText: "Select any countries you've visited within the past month",
      answers: ["USA", 
                "Brazil", 
                "Italy", 
                "China"
      ],
      type: "checkbox"
    },
  ],
  identifier: "COVID"
}

const moodCheckinSurvey = {
  title: "Daily Mood Check-in",
  pointValue: 250,
  type: "mood",
  questions: [
    {
      questionText: "Select any options which describe today's mood",
      answers: ["anxiety", 
                "fear",
                "gratitude",
                "happiness", 
                "loneliness",
                "positivity", 
                "sadness", 
                "stress", 
                "other",
      ],
      type: "checkbox"
    }
  ],
  identifier: "MOOD"
}

const initialSurvey = {
  "COVID": covidCheckinSurvey,
  "MOOD": moodCheckinSurvey
}

function store_survey_results_for_user(recordID, surveyID, surveyResponse, userZIP) {
  return new Promise( async (resolve, reject) => {
    let url = API_URL + "/record-survey-response"
    url += "?authToken=" + window.localStorage.authToken

    try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({recordID, surveyID, surveyResponse, userZIP}) // body data type must match "Content-Type" header
      });
      if (response.ok) resolve(response)
      else reject(response)
    } catch(err) {
      reject(err)
    }
  })  
}

const Surveys = ({authToken, userInfo, setUserInfo, profileInfo, outstandingSurveys}) => {
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

  if (!survey) {
    return (
      <Container fluid> 
        <PageTitle pageName="Surveys" score={userInfo.score}/> 
        <NewSurveysView surveys={outstandingSurveys} userInfo={userInfo}
                        handleSurveyClick={surveyID => history.push(`/surveys/${surveyID}`)}/>

      </Container>
    );
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
                    privacyNotice=' '
                    handleSubmit={responses => {
                      let identifier = survey.identifier || survey._id
                      responses.push(today_as_string()) // include date with survey response
                      let responseString = JSON.stringify(responses)
                      let userPassword = window.localStorage.password
                      im.create_data_management(responseString, identifier, "editable", userPassword, "")
                      .then(recordID => {
                        im.upload_file_for_record({name: identifier, type: "text/plain"}, responseString, recordID, userPassword)
                        .then(done => {
                          store_survey_results_for_user(recordID, identifier, responseString, profileInfo[2])
                          .then(success => {
                            userInfo.score += survey.pointValue
                            userInfo[identifier] = today_as_string()
                            setUserInfo(userInfo)
                            history.push('/dashboard')
                          })
                          .catch(errResponse => {
                            console.error(errResponse)
                            alert("Failed to record survey response")
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
                      })}
                    }
                    />            
      </Container>
  );
}

export default Surveys;
