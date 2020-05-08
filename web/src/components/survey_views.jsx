import React, {useState} from "react";
import { 
    Container, 
    Form,
    Row,
    Col,
    ProgressBar
} from "react-bootstrap";

import "../styles/surveys.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faIdCard,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons'

const CheckboxQuestion = ({type, answers}) => {
  answers = answers || []
  type = type || "checkbox"

  let defaultState = []
  answers.map(a => {
    defaultState.push(0)
  })

  const [questionState, setQuestionState] = useState(defaultState)

  function updateCheckedState(index) {
    questionState[index] = !questionState[index]
    setQuestionState([...questionState])
  }

  function fieldClasses(index) {
    if (!questionState[index]) return "unchecked";

    return "checked"
  }

  function questionIconStyle() {
    for (let state of questionState) {
      if (state) return "completed";
    }

    return ""
  }

  return (
    <div>
      <div className="question-number"> 
      <FontAwesomeIcon as="span" className={`mr-2 question-complete-icon ${questionIconStyle()}`} icon={faCheckCircle} size="2x" />
      
      <span className="big">Q1</span> <span className="small">of 4</span> <br/>
      <p className="question-text mt-1"> Select any countries you've visited in the past 14 days: </p>
      </div>

      {answers.map((answer, aIndex) => {
        return (
        <div id={aIndex} className="checkfield clickable mb-2" onClick={e => updateCheckedState(aIndex)}>

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
}

const SurveyForm = ({formContent}) => {
  if (!formContent) return <div></div>

  let answers = [
    "Italy", "China", "USA", "Brazil", "None"
  ]

  return (
  <div>
    <div>
      <Row>
      <Col>
        <span>
        <FontAwesomeIcon as="span" className="float-left mr-3 my-auto" icon={faIdCard} size="4x" />
        <span className="align-top">
          <span className="survey-title mb-0 pb-0"> Onboarding Survey </span>    
          <br/>
          <span className="survey-subtitle pt-0 mt-0"> Immunify </span>
        </span>
        </span>
      </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={4} xs={3}>
          <span className="survey-header-item">Community Completion <br/>
          <span className="survey-header-value"> 100%</span>
          </span>
        </Col>
        <Col>
          <span className="survey-header-item">No. Questions <br/>
          <span className="survey-header-value">4</span>
          </span>
        </Col>
        <Col>
          <span className="survey-header-item">Est. Time <br/>
          <span className="survey-header-value">2min</span>
          </span>
        </Col>
        <Col>
          <span className="survey-header-item">Points <br/>
          <span className="survey-header-value">100</span>
          </span>
        </Col>
      </Row>
      <Row>
      <Col>
        <ProgressBar className="mt-2 survey-progress" size="sm" now={50} />
      </Col>
      </Row>
    </div>
    <div className="mt-5">
      <Form>
        <CheckboxQuestion answers={answers}/>
      </Form>
    </div>
  </div>    
  );
}

export default SurveyForm;
