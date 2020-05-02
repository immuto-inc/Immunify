import React, { Component } from 'react'

export default class PreviewForm extends Component {

    renderQuestions = () => {
        return this.props.questions.map((question, index) => {
            return (
                <div key={index}>
                    ------------
                    <br />
                    <label>{question.question}</label>
                    <input type={question.inputType} />
                    <br /><br />
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
                <h3>{this.props.dbInfo.title}</h3>
                <h4>{this.props.dbInfo.institution}</h4>

                {this.renderQuestions()}
            </div>
        )
    }
}
