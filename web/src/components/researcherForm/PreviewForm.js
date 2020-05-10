import React, { Component } from 'react'

export default class PreviewForm extends Component {

    renderQuestions = () => {
        return this.props.questions.map((question, index) => {
            // I want to point out that I know 
            // question.question.question is disgusting but I did not
            // plan for this to happen and I will go back to fix it if
            // there is time
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
