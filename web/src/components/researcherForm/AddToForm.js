import axios from 'axios'
import React, { Component } from 'react'
import MultipleChoice from './MultipleChoice'

export default class AddToForm extends Component {
    state = {
        inputType: "text",
        question: "",
        showMultipleChoice: false,
    }

    // Shows the user an example of what the question they are currently working on
    // will look like in the form
    renderSampleInput = () => {
        return (
            <React.Fragment>
                <br /><br /><br />
                <label htmlFor="question" >Sample of Form: </label>
                <br />
                --------------------<br />
                {this.state.question}
                <br />
                <input type={this.state.inputType} name="question" id="question" ></input>
                <br />
                --------------------
            </React.Fragment>
        )
    }

    // The user can choose if they want their question to be text input, number input, 
    // or multiple choice
    renderInputTypeButton = () => {
        return (
            <React.Fragment>
                <button onClick={this.showText} >Text</button>
                <button onClick={this.showNumber}>Number</button>
                <button onClick={this.showMultipleChoice}>Multiple Choice</button>
            </React.Fragment>
        )
    }

    showText = () => {
        this.setState({ inputType: "text" })
        this.setState({ showMultipleChoice: false })
    }

    showNumber = () => {
        this.setState({ inputType: "number" })
        this.setState({ showMultipleChoice: false })
    }

    showMultipleChoice = () => {
        this.setState({ showMultipleChoice: true })
    }


    // Adds the question to the form
    // Resets the preview down below to contain the newly added question
    // Clears out the input
    addToForm = async () => {
        const data = {
            formId: this.props.formId,
            inputType: this.state.inputType,
            question: this.state.question,
        }
        await axios.post(`http://localhost:8001/addToForm`, data)
            .catch((err) => {
                console.error(err)
            })

        this.props.fetchQuestionList()
        this.setState({ question: "" })
    }

    render() {
        if (this.state.showMultipleChoice) {
            // This renders if the researcher is working on a multiple choice question
            return (
                <div>
                    {this.renderInputTypeButton()}
                    <br />
                    <MultipleChoice formId={this.props.formId} fetchQuestionList={this.props.fetchQuestionList} />
                </div>
            )
        } else {
            // This renders if the researcher is working on a text/ numeric question
            return (
                <div>
                    {this.renderInputTypeButton()}
                    <br />

                    <label htmlFor="question" >Question: </label>
                    <input
                        value={this.state.question}
                        onChange={(event) => this.setState({ question: event.target.value })}
                        type="text"
                        name="question"
                        id="question"
                        placeholder="Please fill out this field"
                    />

                    {this.renderSampleInput()}

                    <br /><br />
                    <button onClick={this.addToForm} >Add to Form</button>
                </div>
            )
        }

    }
}
