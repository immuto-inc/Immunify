import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import Copyright from "./copyright"

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: '#f8f9fc',
    padding: theme.spacing(6),
  },
}));

const Footer = () => {
    const classes = useStyles();
    
    return (
    <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
            Immunify
             <Typography variant="subtitle1" align="center" color="inherit" component="p">
          <Link color="inherit" target="_blank" rel="noopener" href="https://www.immuto.io">
            Powered by Immuto
          </Link>{' '}
        </Typography>
        </Typography>
        <Copyright />
    </footer>
    );
}

export default Footer