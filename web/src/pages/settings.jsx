import React, { useEffect } from "react";
import { 
    Container, 
    Card
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"
import { check_logged_in } from "../utils"

const Settings = ({authToken, userInfo, profileInfo}) => {
  let history = useHistory()  

  useEffect(() => {
    check_logged_in(authToken)
    .then(result => {console.log("Authenticated")})
    .catch(err => {
      console.error(err)
      window.localStorage.authToken = ""
      history.push('/login')
    })
  }, [authToken, history])
  
  if (!userInfo) {
    return (
      <Container fluid> 
        <PageTitle pageName="Settings"/>        
      </Container>
    );
  }

  if (!userInfo.profileInfo) { 
    history.push('/dashboard') // to fill out onboarding form
  }
  return (
    <Container fluid> 
      <PageTitle pageName="Settings" score={userInfo.score}/>  
      <Card className="shadow">     
        <Card.Header>Your Account Settings</Card.Header>
        <Card.Body>
          <Card.Title>Communication</Card.Title>
          <Card.Text>
          Email: {userInfo.email}
          </Card.Text>
          <Card.Text className="text-purple">
          There are no email settings to change yet. <br/>In the future, you will be able 
          to opt in to survey reminders, weekly progress updates, and more!
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Settings;
