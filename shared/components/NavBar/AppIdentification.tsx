import {Box} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Theme, darken} from '@mui/system';

import Logo from '@root/public/logo.svg';
import {useVisibleSection} from './hooks/useVisibleSection';
import {cx} from '@emotion/css';

const useStyle = makeStyles((theme: Theme) => {
  const manifestBackgroundColor = theme.palette.augmentColor({color: {main: '#F8C3A9'}});
  return {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },

    appTitle: {
      color: theme.palette.common.white,
      fontSize: '28px !important',
      fontStyle: 'normal',
      fontWeight: 900,
      lineHeight: 'normal',
      letterSpacing: -0.56,

      [theme.breakpoints.down('md')]: {
        fontSize: '16px !important',
      },
    },
    dark: {
      color: darken(manifestBackgroundColor.dark, 0.5),
    },

    appIcon: {
      width: 37,
      height: 37,

      [theme.breakpoints.down('md')]: {
        width: 24,
        height: 24,
      },
    },
  };
});

export const AppIdentification = () => {
  const {visibleSection} = useVisibleSection(64);
  const isDark = visibleSection > 0;

  const classes = useStyle();
  return (
    <Box className={classes.root}>
      <Logo className={cx(classes.appIcon, {[classes.dark]: isDark})} />
      <h1 className={cx(classes.appTitle, {[classes.dark]: isDark})}>Voting Poker</h1>
    </Box>
  );
};
