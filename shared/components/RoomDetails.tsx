import {Box, Button, Theme, Typography, darken, useMediaQuery, useTheme} from '@mui/material';
import React, {useState} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import UserDetails from './UserDetails';
import {User} from '@root/types/User';
import {useSession} from '../hooks/useSession';
import SessionVotesSummary from './SessionVotesSummary';
import ModeratorControls from './ModeratorControls';
import {Timer} from './Timer';
import {InviteUrl} from './InviteUrl';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    flex: `0 1 400px`,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(4, 6),
    borderRadius: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)})`,
    overflowY: 'auto',

    [theme.breakpoints.down('sm')]: {
      height: 'auto',
      padding: theme.spacing(2, 3),
      overflowY: 'visible',
    },
  },
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),

    '& .MuiTypography-subtitle1': {
      textAlign: 'left',
      width: '100%',
    },

    '&:not(:last-child):after': {
      content: '""',
      width: '100%',
      height: 2,
      borderRadius: 1,
      backgroundColor: darken(theme.palette.background.paper, 0.5),
      display: 'block',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
  },
  footer: {
    marginTop: 'auto',
  },
}));

interface RoomDetailsProps {
  sessionId: string | null;
  roomId: string;
  ended: boolean;
  user: User;
  users: User[];
  updateUser: (value: Partial<User>) => void;
}

const RoomDetails = ({sessionId, roomId, ended, user, users, updateUser}: RoomDetailsProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const {startSession, endSession} = useSession(roomId);
  const isMoble = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobileOpen = !isMoble || mobileOpen;

  return (
    <Box className={classes.root}>
      <Box className={classes.section}>
        <Typography variant="subtitle1">Session duration</Typography>
        <Timer roomId={roomId} />
      </Box>
      <Box className={classes.section}>
        <Typography variant="subtitle1">Participants</Typography>
        <SessionVotesSummary users={users} roomId={roomId} />
      </Box>
      {user?.moderator && (
        <Box className={classes.section}>
          <Typography variant="subtitle1">Moderator Controls</Typography>
          <ModeratorControls
            sessionId={sessionId}
            ended={ended}
            onReleaseModerator={() => updateUser({...user, moderator: false})}
            onSessionEnd={endSession}
            onSessionStart={startSession}
          />
        </Box>
      )}

      {isMobileOpen && (
        <>
          <Box className={classes.section}>
            <Typography variant="subtitle1">Invite participants</Typography>
            <InviteUrl value={`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/${roomId}`} />
          </Box>
          <Box className={classes.section}>
            <Typography variant="subtitle1">Express yourself!</Typography>
            <UserDetails user={user} updateUser={updateUser} />
          </Box>
        </>
      )}
      {isMoble && (
        <Button variant="text" color="secondary" onClick={() => setMobileOpen((e) => !e)}>
          <ExpandMoreRoundedIcon
            sx={{
              transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: theme.transitions.create('transform'),
            }}
          />
        </Button>
      )}
      {!isMoble && (
        <Box className={classes.footer}>
          Made with ❤️ by&nbsp;
          <a href="https://github.com/jeffersonmourak" target="_blank">
            jeffersonmourak
          </a>
        </Box>
      )}
    </Box>
  );
};

export default RoomDetails;
