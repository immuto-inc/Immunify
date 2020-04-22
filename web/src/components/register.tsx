import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Copyright from './copyright'
import { useHistory } from "react-router-dom"

import { API_URL, IMMUTO_URL } from "../utils";

// @ts-ignore
import immuto from 'immuto-backend';
export const im = immuto.init(true, IMMUTO_URL);

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Register = () => {
  const classes = useStyles();
  const history = useHistory();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")

  const handleEmailChange = (e : React.ChangeEvent<HTMLInputElement>) => {
     setEmail(e.target.value);
  }
  const handlePasswordChange = (e : React.ChangeEvent<HTMLInputElement>) => {
     setPassword(e.target.value);
  }
  const handlePasswordConfirmationChange = (e : React.ChangeEvent<HTMLInputElement>) => {
     setPasswordConfirmation(e.target.value);
  }

  function handleForm(e : React.FormEvent<HTMLFormElement>) {
      if (im.authToken) {
          im.deauthenticate()
      }

      e.preventDefault()

      register_user(email, password).then((result) => {
        history.push('/login')          
      }).catch((err) => {
          alert(`Error on registration: ${err}`)
      })
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={handleForm}>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={handleEmailChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handlePasswordChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password-confirm"
                label="Confirm Password"
                type="password"
                id="password-confirm"
                autoComplete="current-password"
                onChange={handlePasswordConfirmationChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}

function register_user(email : string, password : string) {
  return new Promise((resolve, reject) => {
      generate_registration_token(email).then((orgToken) => {
          im.register_user(email, password, orgToken).then(() => {
              resolve()
          }).catch((err : string) => {
              reject(err)
          })
      }).catch((err : string) =>{
          reject(err)
      })
  })
}

function generate_registration_token(email : string) {
  return new Promise((resolve, reject) => {
      var http = new XMLHttpRequest()
      let sendstring = "email=" + email.toLowerCase()
      http.open("POST", API_URL + "/register-org-user", true)
      http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
      http.onreadystatechange = () => {
          if (http.readyState === 4 && http.status === 200) {
              let regToken = http.responseText
              resolve(regToken)
          } else if (http.readyState === 4) {
              reject(http.responseText)
          }
      }
      http.send(sendstring)
  })
}

export default Register;
