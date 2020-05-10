import axios from 'axios'
import React, { Component } from 'react'

export default class MultipleChoice extends Component {
    state = {
        question: "",
        choices: [""],
    }

    // Renders each of the inputs for the choices within the MC question
    // so that the user can edit them
    renderChoices = () => {
        return this.state.choices.map((choice, index) => {
            return (
                <div key={index}>
                    {index + 1} ->
                    <input
                        type="text"
                        id={index}
                        value={this.state.choices[index]}
                        onChange={(event) => this.changeChoiceValue(event)}
                    />
                </div>
            )
        })
    }

    // Renders each of the the choices within the MC question
    // so that the user can see what they will look like in the form
    sampleOfChoices = () => {
        return this.state.choices.map((choice, index) => {
            return (
                <div key={index}>
                    <input type="radio" id={index} name={this.state.question} value={choice} />
                    <label htmlFor={choice}>{choice}</label>
                    <br />
                </div>
            )
        })
    }

    // Allows the researcher to edit the labels for each of the choices
    changeChoiceValue = (event) => {
        let newChoices = this.state.choices
        newChoices[event.target.id] = event.target.value
        this.setState({ choices: newChoices })
    }

    // Allows the researcher to add a new choice to their MC question
    addNewChoice = () => {
        let newChoices = this.state.choices.concat("")
        this.setState({ choices: newChoices })
    }

    // Adds the question to the list of questions
    // Fetches the new preview with the new question added
    // Clears the inputs
    addToForm = async () => {
        const data = {
            formId: this.props.formId,
            inputType: "Multiple Choice",
            question: {
                question: this.state.question,
                choices: this.state.choices,
            }
        }
        await axios.post(`http://localhost:8001/addToForm`, data)
            .catch((err) => {
                console.error(err)
            })

        this.props.fetchQuestionList()
        this.setState({ question: "" })
        this.setState({ choices: [""] })
    }


    render() {
        return (
            <div>
                <label htmlFor="question" >Question: </label>
                <input
                    value={this.state.question}
                    onChange={(event) => this.setState({ question: event.target.value })}
                    type="text"
                    name="question"
                    id="question"
                    placeholder="Please fill out this field"
                />

                <br />
                <button onClick={this.addNewChoice}>Add a Choice</button>
                {this.renderChoices()}

                <br /><br /><br />
                <label htmlFor="question" >Sample of Form: </label>
                <br />--------------------<br />
                {this.state.question}
                <br />
                {this.sampleOfChoices()}

                <br /><br />
                <button onClick={this.addToForm}>Submit</button>

            </div>
        )
    }
}
