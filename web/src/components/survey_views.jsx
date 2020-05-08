import React, { useState, useEffect } from "react";
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

const CheckboxQuestion = 
({type, questionText, answers, questionNumber, totalQuestions, setComplete, setIncomplete}) => {
  answers = answers || []
  type = type || "checkbox"
  totalQuestions = totalQuestions || 1
  questionNumber = questionNumber || 1
  questionText = questionText || "No question text provided"

  let defaultState = []
  answers.map(a => {
    defaultState.push(false)
  })

  const [questionState, setQuestionState] = useState(defaultState)

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

    let answersChecked = 0
    questionState.map(answerChecked => {
      if (answerChecked) { answersChecked++; }
    })

    if (answersChecked) {
      setComplete()
    } else {
      setIncomplete();
    }
    
  }

  function fieldClasses(index) {
    if (!questionState[index]) return "unchecked";

    return "checked"
  }

  function questionIconStyle() {
    for (let state of questionState) {
      if (state) {
        //setComplete()
        return "completed"
      };
    }

    //setIncomplete()
    return ""
  }

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
}

const SurveyForm = ({questions, communityCompletion, pointValue, timeEstimate}) => {
  questions = questions || []
  communityCompletion = communityCompletion || 100
  pointValue = pointValue || 100
  timeEstimate = timeEstimate || 2

  const [surveyCompletion, setSurveyCompletion] = useState([])

  useEffect(() => {   
    questions.map((question, qIndex) => {
      surveyCompletion.push(false)
    })
  }, []);

  const completionStatus = (currentCompletion) => {
    let completionCount = 0
    currentCompletion.map(isCompleted => {
      if (isCompleted) {completionCount++;}
    })
    return (completionCount / questions.length) * 100
  }

  
  if (!questions.length) return <div></div>
  return (
  <div className="card p-4 shadow">
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
          <span className="survey-header-value"> {communityCompletion}%</span>
          </span>
        </Col>
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
      <Col>
        <ProgressBar className="mt-2 survey-progress" size="sm" now={completionStatus(surveyCompletion)} />
      </Col>
      </Row>
    </div>
    <div className="">
      <Form>
        {questions.map((question, qIndex) => {
          return (
          <div className="mt-4">
          <CheckboxQuestion
            key={qIndex}
            answers={question.answers} 
            questionText={question.questionText}
            questionNumber={qIndex + 1}
            totalQuestions={questions.length}
            type={question.type}
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
        
      </Form>
    </div>
  </div>    
  );
}

export default SurveyForm;
