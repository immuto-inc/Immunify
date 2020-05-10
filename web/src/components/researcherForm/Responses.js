
import axios from 'axios'
import React, { Component } from 'react'

export default class Responses extends Component {
    state = {
        responses: null
    }


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

    renderResponses = () => {
        let questions = []
        console.log(this.state.responses)
        return this.state.responses.map((user, index) => {
            let response = Object.keys(user.answers)

            return (
                <div key={index}>
                    <br />
                    Response ID: {user._id}
                    <br />
                    {response[0]} => {user.answers[response[0]]}
                    <br />
                    {response[1]} => {user.answers[response[1]]}
                </div>
            )
        })
    }

    render() {
        if (this.state.responses == null) {
            return (
                <div>
                    <h4>Loading...</h4>
                </div>
            )
        }

        if (this.state.responses.length == 0) {
            return (
                <div>
                    <h4>No Responses Yet</h4>
                </div>
            )
        }
        return (
            <div>
                {this.renderResponses()}
            </div>
        )
    }
}
