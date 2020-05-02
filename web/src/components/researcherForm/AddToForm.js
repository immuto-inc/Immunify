import axios from 'axios'
import React, { Component } from 'react'

export default class AddToForm extends Component {
    state = {
        inputType: "text",
        question: "",
    }

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

    renderInputTypeButton = () => {
        return (
            <React.Fragment>
                <button onClick={() => this.setInputType("text")} >Text</button>
                <button onClick={() => this.setInputType("number")}>Number</button>
            </React.Fragment>
        )
    }

    setInputType = (t) => {
        this.setState({
            inputType: t
        })
    }

    addToForm = async () => {
        console.log(this.props.formId)
        const data = {
            formId: this.props.formId,
            inputType: this.state.inputType,
            question: this.state.question,
        }
        await axios.post(`http://localhost:8001/addToForm`, data)
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                console.error(err)
            })

        this.props.fetchQuestionList()
    }

    render() {
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
