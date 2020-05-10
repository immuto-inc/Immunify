import React, { useState, useEffect } from "react";
import { 
    Form,
    Row,
    Col,
    ProgressBar,
    Button,
    Spinner
} from "react-bootstrap";

import "../styles/surveys.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faIdCard,
    faCheckCircle,
    faHandHoldingMedical,
    faNotesMedical
} from '@fortawesome/free-solid-svg-icons'

import { SurveyCard } from "./card_views"

import { today_as_string, time_until_survey_reset } from "../utils"

const CheckboxQuestion = 
({type, questionText, answers, textInputProps, questionNumber, totalQuestions,
setComplete, setIncomplete, setSelectedValue}) => {
  answers = answers || []
  type = type || "checkbox"
  totalQuestions = totalQuestions || 1
  questionNumber = questionNumber || 1
  questionText = questionText || "No question text provided"

  let defaultState = []
  answers.map(a => {
    defaultState.push(false);
  })

  const [questionState, setQuestionState] = useState(defaultState)
  const [inputText, setInputText] = useState('')

  function updateCheckedState(index) {
    questionState[index] = !questionState[index]

    if (type === "radio" && questionState[index] === true) {
      questionState.map((question, qIndex) => {
        if (qIndex !== index) {
          questionState[qIndex] = false
        }
      })
    }
    setQuestionState([...questionState])

    let selectedAnswers = []
    let answersChecked = 0
    questionState.map((answerChecked, aIndex) => {
      if (answerChecked) { 
        selectedAnswers.push(answers[aIndex])
        answersChecked++; 
      }
    })

    setSelectedValue(selectedAnswers)
    if (answersChecked) {
      setComplete()
    } else {
      setIncomplete();
    }
  }

  function fieldClasses(index) {
    if (!questionState[index]) return "unchecked";
    return "checked";
  }

  function questionIconStyle() {
    if (inputText) return "completed"; // for text forms

    for (let state of questionState) {
      if (state) {
        return "completed"
      };
    }
    return ""
  }

  if (type === "radio" || type === "checkbox"){
    return (
      <div>
        <div className="question-number"> 
        <FontAwesomeIcon as="span" className={`mr-2 question-complete-icon ${questionIconStyle()}`} icon={faCheckCircle} size="2x" />
        
        <span className="big">Q{questionNumber}</span> <span className="small">of {totalQuestions}</span> <br/>
        <p className="question-text mt-1">{questionText} </p>
        </div>
  
        {answers.map((answer, aIndex) => {
          return (
          <div key={aIndex} 
               id={aIndex} 
               className="checkfield clickable mb-2" 
               onClick={e => updateCheckedState(aIndex)}>
  
          <Form.Check
            className={fieldClasses(aIndex)}
            onChange={e => console.log(e.target.checked)}
            checked={questionState[aIndex]}
            type={type}
            label={
              <span>
              <span className={`custom-check align-middle ${fieldClasses(aIndex)}`}></span>
              <span className="align-middle">{answer}</span>
              </span>
            }
            />
          </div>);
        })}
      </div>
    );
  } else if (type === "text") {
    return (
      <div>
        <div className="question-number"> 
        <FontAwesomeIcon as="span" className={`mr-2 question-complete-icon ${questionIconStyle()}`} icon={faCheckCircle} size="2x" />
        
        <span className="big">Q{questionNumber}</span> <span className="small">of {totalQuestions}</span> <br/>
        <p className="question-text mt-1">{questionText} </p>
        </div>
        
        <Form.Group controlId="text-input">
          <Form.Control type="text" 
                        placeholder={textInputProps.placeholder} 
                        value={inputText}
                        onChange={(e) => {
                          let validator = textInputProps.validator || (e => {return e})
                          let validatedText = validator(e.target.value)
                          setInputText(validatedText)
                          setSelectedValue(validatedText)
                          if (validatedText) {
                            setComplete()
                          } else {
                            setIncomplete()
                          }
                        }}/>
          <Form.Text className="text-muted">
            {textInputProps.message}
          </Form.Text>
        </Form.Group>

      </div>
    );
  }

}

const SurveyForm = (
  {questions, communityCompletion, pointValue, timeEstimate, 
    handleSubmit, privacyNotice,
    title, sponsor, icon, type}) => {
  questions = questions || []
  communityCompletion = communityCompletion || 100
  pointValue = pointValue || 100
  timeEstimate = timeEstimate || 2
  title = title || "Onboarding Survey"
  sponsor = sponsor || "Immunify"
  icon = icon || faIdCard
  if (type === "medical") icon = faNotesMedical
  else if (type === "mood") icon = faHandHoldingMedical
  privacyNotice = privacyNotice || <div>Your responses to this survey will be kept completely private by default <br/>
  Later, you may choose to share select information with healthcare providers or researchers</div>

  const [surveyCompletion, setSurveyCompletion] = useState([])
  const [surveyValues, setSurveyValues] = useState([])
  const [submitText, setSubmitText] = useState('Submit')
  const [handleingSubmit, setHandleingSubmit] = useState(false)

  useEffect(() => {   
    questions.map((question, qIndex) => {
      surveyCompletion.push(false)
      surveyValues.push('')
    })
  }, []);

  const completionStatus = (currentCompletion) => {
    let completionCount = 0
    currentCompletion.map(isCompleted => {
      if (isCompleted) {completionCount++;}
    })
    return (completionCount / questions.length) * 100
  }

  function handleSurveySubmit(e) {
    e.preventDefault()
    setSubmitText(<span><Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="mr-2"
                  />
                  Submitting...</span>)
    setHandleingSubmit(true)
    handleSubmit(surveyValues)
  }
  
  if (!questions.length) return <div></div>
  return (
  <div className="card p-4 shadow survey">
    <div>
      <Row>
      <Col>
        <span>
        <FontAwesomeIcon as="span" className="float-left mr-3 my-auto text-primary-dark" icon={icon} size="4x" />
        <span className="align-top">
          <span className="survey-title mb-0 pb-0">{title}</span>    
          <br/>
          <span className="survey-subtitle pt-0 mt-0">{sponsor}</span>
        </span>
        </span>
      </Col>
      </Row>
      <Row className="mt-3">
        {/*<Col sm={4} xs={12}>
          <span className="survey-header-item">Community Completion <br/>
          <span className="survey-header-value"> {communityCompletion}%</span>
          </span>
        </Col>*/}
        <Col>
          <span className="survey-header-item">No. Questions <br/>
          <span className="survey-header-value">{questions.length}</span>
          </span>
        </Col>
        <Col>
          <span className="survey-header-item">Est. Time <br/>
          <span className="survey-header-value">{timeEstimate}min</span>
          </span>
        </Col>
        <Col>
          <span className="survey-header-item">Points <br/>
          <span className="survey-header-value">{pointValue}</span>
          </span>
        </Col>
      </Row>
      <Row>
      <Col className="pb-3">
        <ProgressBar className="mt-2 survey-progress" size="sm" now={completionStatus(surveyCompletion)} />
      </Col>
      </Row>
    </div>
    <div className="overflow-auto"> {/*For scrolling*/}
      <div className="my-2 text-purple privacy-notice">
      {privacyNotice}
      </div>
      <Form onSubmit={handleSurveySubmit}>
        {questions.map((question, qIndex) => {
            return (
            <div className="mt-3" key={qIndex}>
            <CheckboxQuestion
              key={qIndex}
              answers={question.answers} 
              textInputProps={question.inputProps}
              questionText={question.questionText}
              questionNumber={qIndex + 1}
              totalQuestions={questions.length}
              type={question.type}
              setSelectedValue={(values) => {
                surveyValues[qIndex] = values
                setSurveyValues([...surveyValues])
              }}
              setComplete={() => {
                surveyCompletion[qIndex] = true
                setSurveyCompletion([...surveyCompletion])
              }}
              setIncomplete={() => {
                surveyCompletion[qIndex] = false
                setSurveyCompletion([...surveyCompletion])
              }}/>
            </div>
          );
        })}
        <Button className="float-right" 
                disabled={completionStatus(surveyCompletion) < 99 || handleingSubmit} 
                type="submit"> 
                {submitText} 
        </Button>
      </Form>
    </div>
  </div>    
  );
}

const NewSurveysView = ({surveys, handleSurveyClick, userInfo}) => {
  surveys = surveys || []
  userInfo = userInfo || {}
  let today = today_as_string()
  let numOutstanding = 0

  return (
    <div>
    <h4 className="mt-4">Today's Surveys</h4>

    <Row xs={1} sm={1} md={2} lg={2} xl={2}>
        {surveys.map((survey) => {
            let title = unescape(survey.title)
            let description = unescape(survey.description)
            let type = unescape(survey.type)
            let sponsor = unescape(survey.sponsor)
            let _id = survey._id
            let identifier = survey.identifier || _id

            if (userInfo[identifier] === today) return;

            numOutstanding ++;
            return (
                <Col key={identifier} className="mb-4" onClick={(e) => handleSurveyClick(identifier)}> 
                <SurveyCard title={title} description={description} type={type} sponsor={sponsor}/>
                </Col>
            );
          })}
      </Row>
      {numOutstanding === 0 ? <div> You've completed all the surveys for today. 
      Come back tomorrow to continue to track your well-being! <br/>
      <span className="text-purple">Surveys reset in {time_until_survey_reset()} at 00:00 UTC</span></div> : ""}
      <hr/> 

    {numOutstanding !== surveys.length ? <div>
      <h4 className="mt-4">Completed Surveys</h4>

      <Row xs={1} sm={1} md={2} lg={2} xl={2}>
          {surveys.map((survey) => {
              let title = unescape(survey.title)
              let description = unescape(survey.description)
              let type = unescape(survey.type)
              let sponsor = unescape(survey.sponsor)
              let _id = survey._id
              let identifier = survey.identifier || _id

              if (userInfo[identifier] !== today) return;

              return (
                  <Col key={identifier} className="mb-4" onClick={(e) => handleSurveyClick(identifier)}> 
                  <SurveyCard title={title} description={description} type={type} sponsor={sponsor}/>
                  </Col>
              );
            })}
        </Row>
        <hr/></div> : ""}

    </div>
  );
}

export default SurveyForm;
export { NewSurveysView }