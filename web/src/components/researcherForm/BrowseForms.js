import axios from 'axios'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
export default class BrowseForms extends Component {
    state = {
        surveys: null
    }

    componentDidMount = async () => {
        await axios.get("http://localhost:8001/browse")
            .then((res) => {
                this.setState({ surveys: res.data })
            })
            .catch((err) => {
                console.error(err)
            })
    }

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

        return (
            <div>
                Available Surveys:
                {this.renderSurveys()}
            </div>
        )
    }
}
