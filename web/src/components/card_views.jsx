import React from "react";
import { 
    Card,
    Row,
    Col
} from "react-bootstrap";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faHandHoldingMedical, // consider faThLg
    faUsers,
    faNotesMedical
} from '@fortawesome/free-solid-svg-icons'

const SurveyCard = ({title, description, type, sponsor}) => {
    type = type || "public"

    let projectIcon = undefined
    let cardClasses = "h-100 shadow clickable border-left-" 
    let iconClasses = "float-right mr-2 mt-1 text-"

    if (type === "medical") {
        projectIcon = faNotesMedical
        cardClasses += "primary"
        iconClasses += "primary"
    } else if (type === "mental") {
        projectIcon = faHandHoldingMedical
        cardClasses += "purple"
        iconClasses += "purple"
    } else { // public 
        projectIcon = faUsers
        cardClasses += "info"
        iconClasses += "info"
    }

    return (
        <Card className={cardClasses}>
          <Card.Header className="font-weight-bold">

          <Row>
          <Col sm={9} xs={8}>
          <span className="w-50">{title}</span>
          <br/>{/*<h6 className="mb-0">{type}</h6>*/}
          <div className="small text-truncate">{sponsor}</div>
          </Col>
          <Col sm={3} xs={4}>
          <FontAwesomeIcon icon={projectIcon} size={"lg"} className={iconClasses}/>
          </Col>
           </Row>


          </Card.Header>

          <Card.Body>
          <Card.Text>{description}</Card.Text>
          </Card.Body>
        </Card> 
    );
}

export { SurveyCard };
export default SurveyCard
