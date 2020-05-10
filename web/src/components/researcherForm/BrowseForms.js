import axios from 'axios'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class BrowseForms extends Component {
    state = {
        surveys: null
    }

    // Gets a list of all of the surveys and stores it in state
    componentDidMount = async () => {
        await axios.get("http://localhost:8001/browse")
            .then((res) => {
                this.setState({ surveys: res.data })
            })
            .catch((err) => {
                console.error(err)
            })
    }

    // Renders info for each survey retrieved above
    renderSurveys = () => {
        return this.state.surveys.map((survey, index) => {
            return (
                <div key={index}>
                    <br />
                    ------------
                    <br />
                    <Link to={`/researcherform/userview/${survey._id}`}>
                        {survey.title}
                    </Link>
                    <h4>{survey.institution}</h4>
                    ------------
                    <br />
                    <br />
                </div>
            )
        })
    }


    render() {
        if (this.state.surveys == null) {
            return (
                <div>
                    Loading...
                </div>
            )
        }

        // else... surveys loaded
        return (
            <div>
                Available Surveys:
                {this.renderSurveys()}
            </div>
        )
    }
}
