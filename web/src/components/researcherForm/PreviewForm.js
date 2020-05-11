import React, { Component } from 'react'

import {
    Button,
    Form,
    Row,
    Col
} from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

export default class PreviewForm extends Component {


    // Renders each of the choices for a MC question
    renderChoices = (question) => {
        return question.choices.map((choice, index) => {
            return (
                <div key={index}>
                    <input type="radio" id={index} name={question.question} value={choice} />
                    <label htmlFor={choice}>{choice}</label>
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
                        <Form.Label>{question.question.question}</Form.Label>
                        {this.renderChoices(question.question)}
                    </div>
                )
            } else {
                // Renders text / number questions 
                return (
                    <div key={index}>
                        <Form.Label>{question.question}</Form.Label>
                        <Form.Control type={question.inputType} />
                    </div>
                )
            }
        })
    }

    render() {
        return (
            <div className="px-4">
                <h2 className="mt-5 text-center">Survey Preview</h2>
                <h3>Title: {this.props.dbInfo.title}</h3>
                <h4>Institution: {this.props.dbInfo.institution}</h4>
                <h4>Estimated Time: {this.props.dbInfo.estimatedTime} minutes</h4>

                {this.renderQuestions()}
            </div>
        )
    }
}
