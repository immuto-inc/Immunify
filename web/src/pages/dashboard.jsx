import React from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"

const Dashboard = ({authToken}) => {
  let history = useHistory()  

  authToken = authToken || window.localStorage.authToken
  if (!authToken) {history.push('/login');}

  return (
      <Container fluid> 
        <PageTitle pageName="Dashboard"/>        
      </Container>
  );
}

export default Dashboard;
