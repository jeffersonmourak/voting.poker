'use client';

import { Box, Button, lighten, Link, Paper, styled, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useContext, useState } from 'react';
import { AnalyticsContext } from './AnalyticsProvider';

const Root = styled(Paper)(({ theme }) => ({
  // width: `calc(100% - ${theme.spacing(4)})`,
  backgroundColor: lighten(theme.palette.primary.main, 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(4),
  position: 'fixed',
  left: theme.spacing(2),
  bottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  zIndex: theme.zIndex.fab,

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    left: theme.spacing(2),
    bottom: theme.spacing(2),
  }
}));

const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(4),
}))

export const DataCollectionNotification = () => {
  const [hide, setHide] = useState(false);
  const { consent } = useContext(AnalyticsContext);
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
    <Root elevation={12}>
      <Box>
        <Typography>
          This site uses cookies to improve your experience. you can read more about it{' '}
          <Link color={'secondary'} href="https://github.com/jeffersonmourak/voting.poker#DATA-COLLECTION-AND-ANALYSIS-ADVISORY">
            Here
          </Link>
        </Typography>
      </Box>
      <Actions>
        <Button variant="contained" color="secondary" onClick={handleEnableUserDataCollection}>
          Accept
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDisableUserDataCollection}>
          Deny
        </Button>
      </Actions>
    </Root>
  );
};
