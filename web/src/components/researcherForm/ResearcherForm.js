import React, { Component } from 'react'
import AddForm from "./AddForm"
import PreviewForm from "./PreviewForm"

export default class ResearcherForm extends Component {
    render() {
        return (
            <div>
                Create a Form!
                <br />-------<br />
                <AddForm />
                <br />-------<br />
                <PreviewForm />
            </div>
        )
    }
}
