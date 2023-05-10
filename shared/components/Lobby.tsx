import {Grid, Theme} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {Typography} from '@mui/material';
import {cx} from '@emotion/css';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '82vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    display: 'flex',
  },
  heroText: {
    fontFamily: ['"Source Code Pro"', 'monospace'].join(', '),
    fontWeight: 900,
    WebkitBackgroundClip: 'text',
    MozBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    MozTextFillColor: 'transparent',
    textAlign: 'center',
  },
  text1: {
    backgroundColor: '#FBAB7E',
    backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
  },
}));

interface LobbyProps {
  roomId: string;
  userId: string;
}

const Lobby = ({roomId, userId}: LobbyProps) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.root}>
      <Typography variant="h1" className={cx(classes.heroText, classes.text1)}>
        Waiting for next session
      </Typography>
    </Grid>
  );
};

export default Lobby;
