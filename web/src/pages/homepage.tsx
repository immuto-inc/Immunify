import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import NavbarIcon from '@material-ui/icons/GroupWorkOutlined';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Grow from '@material-ui/core/Grow';
import { palette } from '@material-ui/system';

import dashboard from '../images/dashboard.png';
import symptoms from '../images/symptoms.png';
import survey from '../images/survey.png';
import community from '../images/community_results.png';
import logo from '../images/logo_bw.png';
import icon from '../images/logo_bw_dots.png';

import Footer from '../components/footer';

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(0),
  },
  heroContent: {
    backgroundColor: '#f8f9fc',
    padding: theme.spacing(8, 0, 6),
  },
  button: {
    backgroundColor: '#21a1da'
  },
  loginButton: {
    backgroundColor: '#f8f9fc'
  },
  toolBar: {
    backgroundColor: '#1675b8'
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    backgroundColor: '#f8f9fc',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  card: {
    backgroundColor: '#f8f9fc',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
}));

const cards = [
  {
    text: 'Participate in Research Studies from your Home',
    image: dashboard
  },
  {
    text: 'Log and Track your Physical and Mental Health ',
    image: symptoms
  },
  {
    text: 'Maintain Full Control of your Personal Data ',
    image: survey
  }
];

const Homepage = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar className={classes.toolBar} style={{color: "white"}}>
          <IconButton edge="start" className={classes.menuButton} href="/" style={{color: "white"}} aria-label="refresh">
            <img src={icon} height="25"/>
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            <Link  href="/" style={{textDecoration: 'none', color: "white"}}> Immunify </Link>
          </Typography>
          <Button className={classes.loginButton} variant="contained" href="/login">Login</Button>
        </Toolbar>
      </AppBar>
      <main>
         {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Immunify
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Improving the health of our communities starts with understanding each other
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button variant="contained" className={classes.button} href="/register">
                    Get Started
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" className={classes.loginButton} href="/login">
                    Sign In
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </div>
        <Container className={classes.cardGrid} maxWidth="xl">
          {/* End hero unit */}
          <Grid container spacing={2}>
            {cards.map((card, idx) => (
              <Grid item key={idx} xs={4} sm={4} md={4}>
                <Grow in={true} timeout={(idx + 1) * 1000}>
                  <Card className={classes.card}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={card['image']} 
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2" align='center'>
                        {card['text']}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
        <Container className={classes.cardGrid} maxWidth="xl">
          {/* End hero unit */}
          <Grid container>
              <Grid item  xs={12} sm={12} md={12}>
                <Grow in={true} timeout={3000}>
                  <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2" align='center'>
                        {"View community-level and national results from anonymized user data"}
                      </Typography>
                    </CardContent>
                    <CardMedia
                      className={classes.cardMedia}
                      image={community} 
                    />
                    
                  </Card>
                </Grow>
              </Grid>
          </Grid>
        </Container>
      </main>
      <Footer />
    </React.Fragment>
  );
}

export default Homepage