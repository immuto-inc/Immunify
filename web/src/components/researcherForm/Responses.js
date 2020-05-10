
import axios from 'axios'
import React, { Component } from 'react'

export default class Responses extends Component {
    state = {
        responses: null
    }

    // Gets all of the responses for this form and sets the state with them
    componentDidMount = async () => {
        let formId = this.props.match.params.formId
        await axios.get(`http://localhost:8001/responses?formId=${formId}`)
            .then((res) => {
                this.setState({ responses: res.data })
            })
            .catch((err) => {
                console.error(err)
            })
    }

    // Renders all of the responses after they are retrieved
    renderResponses = () => {
        return this.state.responses.map((user, index) => {
            let response = Object.keys(user.answers)
            return (
                <div key={index}>
                    <br />
                    <br />
                    -------------------
                    <br />
                    Response ID: {user._id}
                    {this.renderResponse(user, response)}
                </div>
            )
        })
    }

    // Helper function for renderResponses to render all of the fields within
    // each response
    renderResponse = (user, response) => {
        return response.map((question, index) => {
            return (
                <div key={index}>
                    <br />
                    {question} => {user.answers[response[index]]}
                </div>
            )
        })

    }

    render() {
        // Before info is loaded
        if (this.state.responses == null) {
            return (
                <div>
                    <h4>Loading...</h4>
                </div>
            )
        }

        // If there are no reponses yet
        if (this.state.responses.length == 0) {
            return (
                <div>
                    <h4>No Responses Yet</h4>
                </div>
            )
        }

        // Else... Render the responses 
        return (
            <div>
                {this.renderResponses()}
            </div>
        )
    }
}
