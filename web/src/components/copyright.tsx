import React from 'react';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

type colorType = "inherit" | "initial" | "textSecondary" | "primary" | "secondary" | "textPrimary" | "error" | undefined;

const Copyright = ({color} : {color? : colorType}) => {
  let textColor = color || "inherit"

  return (
    <Typography variant="body2" color={textColor} align="center">
      {'Copyright © '}
      <Link color={textColor} target="_blank" rel="noopener" href="https://www.immuto.io">
        Immuto, Inc.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default Copyright