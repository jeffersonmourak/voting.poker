import {Box, Button} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Theme} from '@mui/material';
import {AppIdentification} from './AppIdentification';
import {Links} from './Links';
import Link from 'next/link';
import {generateRoomId} from '@root/shared/helpers/room';
import {useVisibleSection} from './hooks/useVisibleSection';
import {cx} from '@emotion/css';
import {alpha} from '@mui/system';

const useStyle = makeStyles((theme: Theme) => {
  const manifestBackgroundColor = theme.palette.augmentColor({color: {main: '#F8C3A9'}});

  return {
    root: {
      display: 'flex',
      width: '100%',
      padding: 40,
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 128,
      position: 'fixed',
      zIndex: 999,
      backdropFilter: 'blur(16px)',
      transition: 'background 0.2s ease-in-out',

      [theme.breakpoints.down('md')]: {
        gap: theme.spacing(1),
      },
    },
    actionButton: {
      background: theme.palette.common.white,

      [theme.breakpoints.down('md')]: {
        display: 'none',
      },

      '&:hover, &:focus': {
        color: theme.palette.common.black,
      },
    },

    darkButton: {
      background: manifestBackgroundColor.dark,

      '&:hover, &:focus': {
        color: theme.palette.common.white,
      },
    },

    light: {
      background: alpha(manifestBackgroundColor.light, 0.35),
    },
  };
});

const ROOM_ID = generateRoomId();

export const NavBar = () => {
  const style = useStyle();
  const {visibleSection} = useVisibleSection(64);
  const isDark = visibleSection > 0;

  return (
    <Box className={cx(style.root, {[style.light]: isDark})}>
      <AppIdentification />
      <Links />
      <Link href={`/${ROOM_ID}`} passHref>
        <Button
          className={cx(style.actionButton, {[style.darkButton]: isDark})}
          variant="contained"
          color={isDark ? 'primary' : 'secondary'}>
          Get a room
        </Button>
      </Link>
    </Box>
  );
};
