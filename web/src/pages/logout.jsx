import React, { useEffect } from "react";
import { 
    Container, 
} from "react-bootstrap";
import { useHistory } from "react-router-dom"

import PageTitle from "../components/page_title"

import { IMMUTO_URL } from "../utils";

import immuto from 'immuto-sdk';
const im = immuto.init(true, IMMUTO_URL);

const Dashboard = ({authToken, userInfo}) => {
  let history = useHistory()  

  useEffect(() => { 
    im.deauthenticate()
    .then(result => history.push('/login'))
    .catch(err => history.push('/login'))
  });

  authToken = authToken || window.localStorage.authToken
  
  return (
    <Container fluid> 
      <PageTitle pageName="Logout"/>
      Logging out...        
    </Container>
  );
}

export default Dashboard;
