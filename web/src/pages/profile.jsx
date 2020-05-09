import React from "react";
import { 
    Container, 
    Card
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"

const Profile = ({authToken, userInfo, profileInfo}) => {
  let history = useHistory()  

  authToken = authToken || window.localStorage.authToken
  if (!authToken) {history.push('/login');}
  
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
            Your demographic information is kept completely private by default.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Profile;
