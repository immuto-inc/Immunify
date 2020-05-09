import React from "react";
import { 
    Container, 
    Row,
    Col
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"
import SurveyForm from "../components/survey_views"
import { SurveyCard } from "../components/card_views"

import { API_URL, IMMUTO_URL } from "../utils";
import immuto from "../immuto"
export const im = immuto.init(true, IMMUTO_URL);

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

function store_demographics_for_user(recordID) {
  return new Promise( async (resolve, reject) => {
    let url = API_URL + "/set-profile-info"
    url += "?authToken=" + window.localStorage.authToken

    try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({recordID}) // body data type must match "Content-Type" header
      });
      if (response.ok) resolve(response)
      else reject(response)
    } catch(err) {
      reject(err)
    }
  })  
}

const Dashboard = ({authToken, userInfo, outstandingSurveys}) => {
  let history = useHistory()  
  outstandingSurveys = outstandingSurveys || [
    {
      title: "Daily COVID Check-in",
      type: "medical",
      sponsor: "Immunify",
      description: "A short survey for COVID-19 related symptoms",
      _id: "COVID"
    },
    {
      title: "Daily Mood Check-in",
      type: "mental",
      sponsor: "Immunify",
      description: "A short survey for tracking your mood and mental well-being",
      _id: "MOOD"
    }
  ]

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
                      let responseString = JSON.stringify(responses)
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
                      })
                    }}
                    />      
      </Container>
    );
  }
  
  return (
    <Container fluid> 
      <PageTitle pageName="Dashboard" score={userInfo.score}/>   
      {userInfo.score === 100 ? "Thanks for completing your onboarding survey!" : ""}
      <Row xs={1} sm={1} md={2} lg={2} xl={3} className="mt-4">
          {outstandingSurveys.map((survey) => {
              let title = unescape(survey.title)
              let description = unescape(survey.description)
              let type = unescape(survey.type)
              let sponsor = unescape(survey.sponsor)
              let _id = survey._id

              return (
                  <Col key={_id} className="mb-4" onClick={(e) => history.push(`/surveys/${_id}`)}> 
                  <SurveyCard title={title} description={description} type={type} sponsor={sponsor}/>
                  </Col>
              );
          })}

      </Row>    
    </Container>
  );
}

export default Dashboard;
