import axios from 'axios'
import React, { Component } from 'react'
import AddToForm from "./AddToForm"
import PreviewForm from "./PreviewForm"

import {
    Button,
    Form,
    Row,
    Col
} from "react-bootstrap"

import 'bootstrap/dist/css/bootstrap.min.css';
var dbInfo = {}
let formId

export default class ResearcherForm extends Component {
    state = {
        questionList: []
    }

    // Gets the info about the question the researcher is currently working on
    componentDidMount = async () => {
        formId = this.props.match.params.formId
        await axios.get(`http://localhost:8001/addToForm?formId=${formId}`)
            .then((res) => {
                dbInfo = res.data
            })
            .catch((err) => {
                console.error(err)
            })
        this.fetchQuestionList()
    }

    // Gets the questions that have already been created by the researcher on this form
    fetchQuestionList = async () => {
        await axios.get(`http://localhost:8001/previewForm?formId=${formId}`)
            .then((res) => {
                this.setState({ questionList: res.data.questions })
            })
            .catch((err) => {
                console.error(err)
            })
    }

    render() {
        return (
            <div>
                <h1 className="text-center mt-2">Create Survey</h1>
                <AddToForm fetchQuestionList={this.fetchQuestionList} dbInfo={dbInfo} formId={this.props.match.params.formId} />
                <PreviewForm questions={this.state.questionList} dbInfo={dbInfo} formId={this.props.match.params.formId} />
            </div>
        )
    }
}
