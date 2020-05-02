import axios from 'axios'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ResearcherFormNew extends Component {
    state = {
        title: '',
        author: '',
        institution: '',
        currentSize: 0,
    }

    createForm = async (event) => {
        event.preventDefault()

        let data = {
            title: this.state.title,
            author: this.state.author,
            institution: this.state.institution,
            currentSize: this.state.currentSize,
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
    }

    render() {
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
                        name="author"
                        id="author"
                        placeholder="author"
                        value={this.state.author}
                        onChange={(event) => this.setState({ author: event.target.value })}
                    />
                    <input
                        type="text"
                        name="institution"
                        id="institution"
                        placeholder="institution"
                        value={this.state.institution}
                        onChange={(event) => this.setState({ institution: event.target.value })}
                    />

                    <button onClick={this.createForm}>Create Form</button>

                    <Link to="/addToForm/:formId">Let me build the form (testing purposes only) </Link>
                </form>
            </div>
        )
    }
}
