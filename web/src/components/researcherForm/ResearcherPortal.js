import axios from 'axios'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ResearcherPortal extends Component {
    state = {
        surveys: null
    }

    componentDidMount = () => {
        // axios.get(`/researcherSurveys/${user.userid}`)
        let authorid = "peter_placeholder_id"
        axios.get(`http://localhost:8001/researcherSurveys?authorid=${authorid}`)
            .then((res) => {
                console.log(res.data)
                this.setState({ surveys: res.data })
            })
            .catch((err) => {
                console.error(err)
            })
    }



    renderExistingSurveys = () => {
        return this.state.surveys.map((survey, index) => {
            return (
                <div key={index}>
                    <br />
                    <h2>{survey.title}</h2>
                    <br />
                    <Link to={`/researcherform/add/${survey._id}`}>Update Survey</Link>
                    <br />
                    <Link to={`/researcherform/responses/${survey._id}`}>View Responses</Link>
                    <br />
                </div>
            )
        })
    }

    render() {
        if (this.state.surveys == null) {
            return (
                <div>
                    <Link to="/researcherform/new">Create Your First Survey</Link>
                </div>
            )
        }

        return (
            < div >
                <Link to="/researcherform/new">Create A New Survey</Link>
                {this.renderExistingSurveys()}
            </div >
        )
    }
}
