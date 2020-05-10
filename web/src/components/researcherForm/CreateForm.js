import axios from 'axios'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

export default class ResearcherFormNew extends Component {
    state = {
        title: '',
        institution: '',
        estimatedTime: '',
        redirect: null,
    }

    createForm = async (event) => {
        event.preventDefault()

        let data = {
            title: this.state.title,
            authorid: "peter_placeholder_id",
            institution: this.state.institution,
            estimatedTime: this.state.estimatedTime,
            questions: [],
        }

        let formId

        await axios.post("http://localhost:8001/createForm", data)
            .then((res) => {
                formId = res.data
                // FIX - This id should be added to the authors list of studies so that it can later be retrieved
            })
            .catch((err) => {
                console.error(err)
            })

        this.setState({ redirect: `/researcherform/add/${formId}` })
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return (
            <div>
                <form>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        placeholder="title"
                        value={this.state.title}
                        onChange={(event) => this.setState({ title: event.target.value })}
                    />
                    <input
                        type="text"
                        name="institution"
                        id="institution"
                        placeholder="institution"
                        value={this.state.institution}
                        onChange={(event) => this.setState({ institution: event.target.value })}
                    />
                    <input
                        type="number"
                        name="et"
                        id="et"
                        placeholder="estimated time in minutes"
                        value={this.state.estimatedTime}
                        onChange={(event) => this.setState({ estimatedTime: event.target.value })}
                    />

                    <button onClick={this.createForm}>Create Form</button>

                </form>
            </div>
        )
    }
}
