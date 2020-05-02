import axios from 'axios'
import React, { Component } from 'react'

export default class PreviewForm extends Component {
    state = {
        dbInfo: {}
    }

    componentDidMount = async () => {
        await axios.get(`http://localhost:8001/addToForm?formId=${this.props.formId}`)
            .then((res) => {
                this.setState({ dbInfo: res.data })
            })
            .catch((err) => {
                console.error(err)
            })
    }


    render() {
        return (
            <div>
                PreviewForm
            </div>
        )
    }
}
