import axios from 'axios';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
    Button,
    Form,
    Row,
    Col
} from "react-bootstrap"

import 'bootstrap/dist/css/bootstrap.min.css';

export default class ResearcherFormNew extends Component {
    state = {
        title: '',
        institution: '',
        estimatedTime: '',
        redirect: null,
    }

    // Creates the form in the DB and redirects to the newly created form
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
                <h1 className="text-center mt-3">Create New Survey</h1>
                <Row>
                <Col>
                <Form className=" w-50 mx-auto">
                    <Form.Control
                        className="my-2"
                        type="text"
                        name="title"
                        id="title"
                        placeholder="title"
                        value={this.state.title}
                        onChange={(event) => this.setState({ title: event.target.value })}
                    />
                    <Form.Control
                        className="my-2"
                        type="text"
                        name="institution"
                        id="institution"
                        placeholder="institution"
                        value={this.state.institution}
                        onChange={(event) => this.setState({ institution: event.target.value })}
                    />
                    <Form.Control
                        className="my-2"
                        type="number"
                        name="et"
                        id="et"
                        placeholder="estimated time in minutes"
                        value={this.state.estimatedTime}
                        onChange={(event) => this.setState({ estimatedTime: event.target.value })}
                    />
                    <Button className="btn btn-primary float-right" onClick={this.createForm}>Create Form</Button>
                </Form>
                </Col>
                </Row>
            </div>
        )
    }
}
