import {Box, Typography, Theme} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {cx} from '@emotion/css';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    minHeight: '82vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(2),
    flex: 1,
    padding: theme.spacing(4),
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

    [theme.breakpoints.down('sm')]: {
      ...theme.typography.h4,
    },
  },
  text1: {
    backgroundColor: '#FBAB7E',
    backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
  },
}));

interface LobbyProps {
  moderator?: boolean;
}

const Lobby = ({moderator = false}: LobbyProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="h1" className={cx(classes.heroText, classes.text1)}>
        Waiting for next session
      </Typography>
      {moderator && (
        <>
          <Typography sx={{paddingX: 2}} variant="body1">
            Hello there! 😊 you are the moderator of this room. You can start the session whenever
            you are ready by clicking at &quot;Start&quot; button.
          </Typography>
          <Typography sx={{paddingX: 2}} variant="body1">
            <strong>
              Note: Any users that connect after you&apos;ve started a session will not be able to
              vote until the next session.
            </strong>
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Lobby;
