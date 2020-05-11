import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import NavbarIcon from '@material-ui/icons/GroupWorkOutlined';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';

import dashboard from '../images/dashboard.png';
import symptoms from '../images/symptoms.png';
import survey from '../images/survey.png';
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
    backgroundColor: '#1675b8'
  },
  toolBar: {
    backgroundColor: '#1675b8'
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    backgroundColor: '#f8f9fc',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    backgroundColor: '#f8f9fc',
    height: '100%',
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
        <Toolbar className={classes.toolBar}>
          <IconButton edge="start" className={classes.menuButton} color="inherit" href="/" aria-label="refresh">
            <NavbarIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            <Link color="inherit" href="/" style={{textDecoration: 'none'}}> Immunify </Link>
          </Typography>
          <Button color="secondary" variant="outlined" href="/login">Login</Button>
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
                  <Button variant="outlined" className={classes.button} href="/register">
                    Get Started
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" className={classes.button} href="/login">
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
                <Card className={classes.card}>
                  <CardMedia
                    className={classes.cardMedia}
                    image={card['image']} 
                    title="Image title"
                  />
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      {card['text']}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      <Footer />
    </React.Fragment>
  );
}

export default Homepage