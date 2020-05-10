import React, { Component } from 'react'

export default class InputType extends Component {

    renderSampleInput = () => {
        return (
            <React.Fragment>
                <label htmlFor="question" >Sample of Form: </label>
                <br /><br /><br />
                <input type={this.props.inputType} name="question" id="question" ></input>
            </React.Fragment>
        )
    }


    render() {
        return (
            <div>
                {this.renderSampleInput()}
            </div>
        )
    }
}
