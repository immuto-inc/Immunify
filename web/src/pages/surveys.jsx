import React, { useState, useEffect } from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory, useParams } from "react-router-dom"

import PageTitle from "../components/page_title"
import SurveyForm, { NewSurveysView } from "../components/survey_views"

import { API_URL, IMMUTO_URL, today_as_string, get_survey_info } from "../utils";
import immuto from "../immuto"
export const im = immuto.init(true, IMMUTO_URL);

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

  const [survey, setSurvey] = useState(undefined)

  useEffect(() => { 
    if (!surveyID) return;

    get_survey_info(authToken, surveyID) 
    .then(surveyInfo => { 
      setSurvey(surveyInfo)
    })
    .catch(err => console.error(err))
  }, [surveyID]);

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

  if (!survey && !surveyID) {
    return (
      <Container fluid> 
        <PageTitle pageName="Surveys" score={userInfo.score}/> 
        <NewSurveysView surveys={outstandingSurveys} userInfo={userInfo}
                        handleSurveyClick={surveyID => history.push(`/surveys/${surveyID}`)}/>

      </Container>
    );
  }

  if (!survey && surveyID) {
    return (
      <Container fluid> 
        <PageTitle pageName="Surveys" score={userInfo.score}/> 
        <span>Loading survey content...</span>
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
                            if (userInfo[identifier + "_transactions"] === undefined) {
                              userInfo[identifier + "_transactions"] = [recordID]
                            } else {
                              userInfo[identifier + "_transactions"].push(recordID)
                            }
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
