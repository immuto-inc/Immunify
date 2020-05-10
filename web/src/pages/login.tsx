import React, { useState, Dispatch, SetStateAction } from "react";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from "react-router-dom"

import Copyright from '../components/copyright';

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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


const Login = ({setAuthToken} : {setAuthToken : Dispatch<SetStateAction<string>>} ) => {
  const classes = useStyles();
  const history = useHistory();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [processingLogin, setProcessingLogin] = useState(false)


  const handleEmailChange = (e : React.ChangeEvent<HTMLInputElement>) => {
     setEmail(e.target.value);
  }
  const handlePasswordChange = (e : React.ChangeEvent<HTMLInputElement>) => {
     setPassword(e.target.value);
  }

  function handleForm(e : React.FormEvent<HTMLFormElement>) {
    setProcessingLogin(true)

    e.preventDefault()

    if (im.authToken) {
        im.deauthenticate()
    }

    im.authenticate(email, password).then((authToken : string) => {
      window.localStorage.password=password
        create_user_session(authToken).then(() => {
          window.localStorage.authToken=authToken
          setAuthToken(authToken)
          history.push('/dashboard')          
        }).catch((err : string) => {
          console.log(err)
          alert("Error logging in: " + err)
        })
        .finally(() => {
          setProcessingLogin(false)
        })
    }).catch((err : string) => {
      setProcessingLogin(false)  
      alert("Unable to login: \n" + err)
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
          Sign in
        </Typography>
        <form className={classes.form} onSubmit={handleForm}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleEmailChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handlePasswordChange}
          />
          {/*<FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />*/}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={processingLogin}
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="" variant="body2">
                {/* Forgot password could go here */}
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

function create_user_session(authToken : string) {
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest()
        let sendstring = "authToken=" + authToken
        http.open("POST", API_URL + "/login-user", true)
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 204) {
                resolve()
            } else if (http.readyState === 4) {
                reject(http.responseText)
            }
        }
        http.send(sendstring)
    })
}

export default Login;
