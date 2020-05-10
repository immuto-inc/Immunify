import axios from 'axios'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

let formId
let dbInfo = {}

export default class UserForm extends Component {
    state = {
        answers: {},
        questionList: [],
        redirect: null,
    }

    // Gets the info about the form
    componentDidMount = async () => {
        formId = this.props.match.params.formId
        await axios.get(`http://localhost:8001/addToForm?formId=${formId}`)
            .then((res) => {
                dbInfo = res.data
            })
            .catch((err) => {
                console.error(err)
            })
        this.fetchQuestionList()
    }

    // Gets the list of questions from the form
    fetchQuestionList = async () => {
        await axios.get(`http://localhost:8001/previewForm?formId=${formId}`)
            .then((res) => {
                this.setState({ questionList: res.data.questions })
            })
            .catch((err) => {
                console.error(err)
            })
    }

    // Changes the state based on how the user interacts with the questions
    updateFields = (event) => {
        let updateField = event.target.name
        let updateVal = event.target.value
        let newAnswers = { ...this.state.answers, [updateField]: updateVal }
        this.setState({ answers: newAnswers })
    }

    // Renders the questions for the user based on the questions in questionList
    renderQuestions = () => {
        return this.state.questionList.map((question, index) => {
            // Renders MC questions
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
                // Renders non-MC questions
                return (
                    <div key={index}>
                        <br />
                        <label>{question.question}</label>
                        <input
                            type={question.inputType}
                            name={question.question}
                            id={question.question}
                            value={this.state.answers[question.question] || ""}
                            onChange={(event) => this.updateFields(event)}
                        />
                        <br /><br />
                    </div>
                )
            }
        })
    }

    // Helper function to render the choices within MC questions
    renderChoices = (question) => {
        return question.choices.map((choice, index) => {
            return (
                <div key={index}>
                    <input type="radio" id={index} name={question.question} value={choice} onClick={(event) => this.updateFields(event)} />
                    <label htmlFor={choice}>{choice}</label>
                    <br />
                </div>
            )
        })
    }

    // When the user submits form, the data is posted to the DB and the
    // user is redirected back to browsing surveys
    handleSubmit = async (event) => {
        event.preventDefault()

        let data = {
            "userid": "peter_placeholder_id",
            "answers": this.state.answers,
        }

        await axios.post(`http://localhost:8001/userSubmit?formId=${formId}`, data)
            .then((res) => {
                if (res.data == "Already Submitted") {
                    console.log("TOAST: You have already submitted this form")
                } else {
                    console.log("TOAST: Success!")
                }
                this.setState({ redirect: "/browse" })
            })
            .catch((err) => {
                console.error(err)
            })
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return (
            <div>
                <h3>Title: {dbInfo.title}</h3>
                <h4>Institution: {dbInfo.institution}</h4>
                <h4>Estimated Time: {dbInfo.estimatedTime} minutes</h4>

                <form >
                    {this.renderQuestions()}
                    <button onClick={this.handleSubmit}>
                        Submit
                    </button>
                </form>
            </div >
        )
    }
}
