import React, { Component } from 'react'

export default class PreviewForm extends Component {


    // Renders each of the choices for a MC question
    renderChoices = (question) => {
        return question.choices.map((choice, index) => {
            return (
                <div key={index}>
                    <input type="radio" id={index} name={question.question} value={choice} />
                    <label htmlFor={choice}>{choice}</label>
                    <br />
                </div>
            )
        })
    }

    // This renders all of the responses to the form that the researcher created.
    // This may be the worst, and most confusing block of code
    // that I have ever written in my life. It was very late when I did it.
    // As of now it works and I am too scared to touch it because I have no idea 
    // what is going on inside.
    renderQuestions = () => {
        return this.props.questions.map((question, index) => {
            // Renders multiple choice questions
            if (question.inputType == "Multiple Choice") {
                return (
                    <div key={index}>
                        ------------
                        <br />
                        <label>{question.question.question}</label>
                        {this.renderChoices(question.question)}
                        <br /><br />
                    </div>
                )
            } else {
                // Renders text / number questions 
                return (
                    <div key={index}>
                        ------------
                        <br />
                        <label>{question.question}</label>
                        <input type={question.inputType} />
                        <br /><br />
                    </div>
                )
            }
        })
    }

    render() {
        return (
            <div>
                Preview
                <br />
                <br />
                <h3>Title: {this.props.dbInfo.title}</h3>
                <h4>Institution: {this.props.dbInfo.institution}</h4>
                <h4>Estimated Time: {this.props.dbInfo.estimatedTime} minutes</h4>

                {this.renderQuestions()}
            </div>
        )
    }
}
