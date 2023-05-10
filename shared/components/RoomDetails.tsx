import {Box, Button, Paper, TextField, Theme, Typography} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import UserDetails from './UserDetails';
import {User} from '@root/types/User';
import {useSession} from '../hooks/useSession';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  section: {
    width: '100%',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

interface RoomDetailsProps {
  sessionId: string | null;
  roomId: string;
  ended: boolean;
  user: User;
  updateUser: (value: Partial<User>) => void;
}

const RoomDetails = ({sessionId, roomId, ended, user, updateUser}: RoomDetailsProps) => {
  const classes = useStyles();
  const {startSession, endSession} = useSession(roomId);

  return (
    <Box className={classes.root}>
      {user?.moderator && (
        <Paper className={classes.section} variant="outlined">
          <Typography variant="h6">Actions</Typography>
          {sessionId && !ended && (
            <Button variant="contained" color="secondary" onClick={endSession}>
              End voting
            </Button>
          )}
          {(!sessionId || ended) && (
            <Button variant="contained" color="secondary" onClick={startSession}>
              New session
            </Button>
          )}

          <Button
            variant="contained"
            color="error"
            onClick={() => updateUser({...user, moderator: false})}>
            Release Moderator
          </Button>
        </Paper>
      )}

      <Paper className={classes.section} variant="outlined">
        <Typography variant="h5">Invite users</Typography>
        <TextField fullWidth value={`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/${roomId}`} />
      </Paper>

      <Paper className={classes.section} variant="outlined">
        <Typography variant="h5">Profile</Typography>
        <UserDetails user={user} updateUser={updateUser} />
      </Paper>
    </Box>
  );
};

export default RoomDetails;
