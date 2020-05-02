import React, { Component } from 'react'
import AddToForm from "./AddToForm"
import PreviewForm from "./PreviewForm"

export default class ResearcherForm extends Component {
    render() {
        const id = this.props.match.params.formId

        return (
            <div>
                Create a Form!
                <br />-------<br />
                <AddToForm formId={id} />
                <br />-------<br />
                <PreviewForm formId={id} />
            </div>
        )
    }
}
