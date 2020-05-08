import React, {useState} from "react";
import { 
    Container, 
    Form
} from "react-bootstrap";

import "../styles/surveys.css"



const SurveyQuestion = ({type, fields}) => {
  const [questionState, setQuestionState] = useState([false])

  function updateCheckedState(index) {
    questionState[index] = !questionState[index]
    setQuestionState([...questionState])
  }

  function fieldClasses(index) {
    if (!questionState[index]) return "unchecked";

    return "checked"
  }

  return (
    <div className="checkfield clickable" onClick={e => updateCheckedState(0)}>

      <Form.Check
        className={fieldClasses(0)}
        onChange={e => console.log(e.target.checked)}
        checked={questionState[0]}
        type='checkbox'
        label={
          <span>
          <span className={`custom-check align-middle ${fieldClasses(0)}`}></span>
          <span className="align-middle">Select Me!</span>
          </span>
        }
      />
    </div>
  );
}

const SurveyForm = ({formContent}) => {
  if (!formContent) return <div></div>

  return (
  <div>
    <Form>
      <SurveyQuestion/>
    </Form>
  </div>    
  );
}

export default SurveyForm;
