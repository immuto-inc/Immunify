import React from "react";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Copyright from './copyright'

// @ts-ignore
import immuto from 'immuto-backend'
export const im = immuto.init(true, "https://dev.immuto.io")


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

const Login = () => {
  const classes = useStyles();

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
        <form className={classes.form} noValidate>
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
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
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

// function handleForm(email, password, history, setUserType) {
//     if (im.authToken) {
//         im.deauthenticate()
//     }

//     im.authenticate(email, password).then((authToken) => {
//         window.localStorage.authToken = authToken
//         create_user_session(authToken).then((r: {userType: string}) => {
//           let userType = ((r.userType && r.userType !== undefined)? r.userType : 'admin')
//           window.localStorage.userType = userType
//           setUserType(userType)
//           history.push("/" + userType)
//         }).catch((err) => {
//             alert("[Error]: " + err)
//         })
//     }).catch((err) => {
        
//         alert("Unable to login: \n" + err)
//     })
// }

// function create_user_session(authToken) {
//   console.log(URL)
//   console.log(JSON.stringify(authToken))
//   // return fetch(URL + 'login-user', {
//   //   method: 'POST',
//   //   mode: 'cors', // no-cors, *cors, same-origin
//   //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//   //   // credentials: 'omit', // include, *same-origin, omit
//   //   headers: {
//   //     'Content-Type': 'application/x-www-form-urlencoded'
//   //   },
//   //   referrerPolicy: 'no-referrer', // no-referrer, *client
//   //   body: "authToken=" + authToken // body data type must match "Content-Type" header
//   // })
//   // .then(r => JSON.parse(r))
//   // .catch(e => console.error("[Login Error]: ", e))
//     return new Promise((resolve, reject) => {
//         var http = new XMLHttpRequest()
//         let sendstring = "authToken=" + authToken
//         http.open("POST", URL + "/login-user", true)
//         http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
//         http.onreadystatechange = () => {
//             if (http.readyState == 4 && http.status == 200) {
//                 let response = JSON.parse(http.responseText)
//                 resolve(response)
//             } else if (http.readyState == 4) {
//                 reject(http.responseText)
//             }
//         }
//         http.send(sendstring)
//     })
// }

export default Login;
