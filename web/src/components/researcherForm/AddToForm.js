import axios from 'axios'
import React, { Component } from 'react'
import MultipleChoice from './MultipleChoice'

import {
    Button,
    Form,
    Row,
    Col
} from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

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
                {this.state.question}
                <Form.Control type={this.state.inputType} name="question" id="question" ></Form.Control>
            </React.Fragment>
        )
    }

    // The user can choose if they want their question to be text input, number input, 
    // or multiple choice
    renderInputTypeButton = () => {
        return (
            <React.Fragment className="text-center mt-4">
            <Row>
                <Button className="btn btn-primary ml-auto mr-2 w-25" onClick={this.showText} >Text</Button>
                <Button className="btn btn-secondary mr-2 w-25" onClick={this.showNumber}>Number</Button>
                <Button className="btn btn-info w-25 mr-auto" onClick={this.showMultipleChoice}>Multiple Choice</Button>
            </Row>
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
                <div className="px-4">
                    {this.renderInputTypeButton()}
                    <MultipleChoice formId={this.props.formId} fetchQuestionList={this.props.fetchQuestionList} />
                </div>
            )
        } else {
            // This renders if the researcher is working on a text/ numeric question
            return (
                <div className="px-4">
                    {this.renderInputTypeButton()}
                    
                    <Form.Label htmlFor="question" className="mt-2">Question: </Form.Label>
                    <Form.Control
                        value={this.state.question}
                        onChange={(event) => this.setState({ question: event.target.value })}
                        type="text"
                        name="question"
                        id="question"
                        placeholder="Please fill out this field"
                    />

                    {this.renderSampleInput()}

                    <Button className="btn-success mt-2" onClick={this.addToForm} >Add to Form</Button>
                </div>
            )
        }

    }
}
