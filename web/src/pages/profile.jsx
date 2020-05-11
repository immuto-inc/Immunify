import React, { useEffect } from "react";
import { 
    Container, 
    Card
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import { check_logged_in } from "../utils"

import PageTitle from "../components/page_title"

const Profile = ({authToken, userInfo, profileInfo}) => {
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
        <PageTitle pageName="Profile"/>        
      </Container>
    );
  }

  if (!userInfo.profileInfo) { 
    history.push('/dashboard') // to fill out onboarding form
  }

  if (!profileInfo) {
    return (
      <Container fluid> 
        <PageTitle pageName="Profile" score={userInfo.score}/>
        Loading profile info...
      </Container>
    );
  }

  return (
    <Container fluid> 
      <PageTitle pageName="Profile" score={userInfo.score}/>  
      <Card className="shadow">     
        <Card.Header>Your Information</Card.Header>
        <Card.Body>
          <Card.Title>Account</Card.Title>
          <Card.Text>
            Email: {userInfo.email}
          </Card.Text>
          <Card.Title>Demographics</Card.Title>
          <Card.Text>
            Age: {profileInfo[0]}
          </Card.Text>
          <Card.Text>
            Sex: {profileInfo[1]}
          </Card.Text>
          <Card.Text>
            Location (ZIP): {profileInfo[2]}
          </Card.Text>
          <Card.Text className="text-purple">
            Your demographic information is kept completely private by default. <br/>
            End-to-end encryption ensures that only you are able to see this information.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Profile;
