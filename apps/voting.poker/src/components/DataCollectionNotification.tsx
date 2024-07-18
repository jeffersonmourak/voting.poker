import { Box, Button, lighten, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Cookies from 'js-cookie';
import { useContext, useState } from 'react';
import { AnalyticsContext } from './AnalyticsProvider';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: lighten(theme.palette.primary.main, 0.1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 0, 6),
    gap: theme.spacing(4),
    position: 'absolute',
    bottom: theme.spacing(6),
    borderRadius: theme.shape.borderRadius,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(4),
  },
}));

export const DataCollectionNotification = () => {
  const [hide, setHide] = useState(false);
  const { consent } = useContext(AnalyticsContext);
  const classes = useStyles();
  const hasAnswerd = Cookies.get('dataCollectionAccepted');
  const hasAccepted = Cookies.get('dataCollectionAccepted') === 'true';

  if (hide || hasAnswerd || hasAccepted) {
    return null;
  }

  const handleEnableUserDataCollection = () => {
    Cookies.set('dataCollectionAccepted', 'true');
    consent(true);
    setHide(true);
  };

  const handleDisableUserDataCollection = () => {
    Cookies.set('dataCollectionAccepted', 'false');
    consent(false);
    setHide(true);
  };

  return (
    <Box className={classes.root}>
      <Box>
        <Typography>
          This site uses cookies to improve your experience. you can read more about it{' '}
          <a href="https://github.com/jeffersonmourak/voting.poker#DATA-COLLECTION-AND-ANALYSIS-ADVISORY">
            Here
          </a>
        </Typography>
        <br />
        <Typography>Do you want to accept the use of cookies?</Typography>
      </Box>
      <Box className={classes.actions}>
        <Button variant="contained" color="secondary" onClick={handleEnableUserDataCollection}>
          Accept
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDisableUserDataCollection}>
          Deny
        </Button>
      </Box>
    </Box>
  );
};
