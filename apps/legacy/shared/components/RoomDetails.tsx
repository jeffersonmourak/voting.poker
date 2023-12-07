import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, Button, Theme, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { User } from '@root/types/User';
import { useState } from 'react';
import { useSession } from '../hooks/useSession';
import { InviteUrl } from './InviteUrl';
import ModeratorControls from './ModeratorControls';
import SessionVotesSummary from './SessionVotesSummary';
import { Timer } from './Timer';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflowY: 'auto',

    [theme.breakpoints.down('sm')]: {
      height: 'auto',
      padding: theme.spacing(2, 3),
      overflowY: 'visible',
    },
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),

    '& .MuiTypography-subtitle1': {
      textAlign: 'left',
      width: '100%',
    },
  },
  group: {
    display: 'flex',
    gap: theme.spacing(2),
  },
}));

interface RoomDetailsProps {
  sessionId: string | null;
  roomId: string;
  ended: boolean;
  user: User | null;
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
      <Box className={classes.group}>
        <Box className={classes.section}>
          <Typography sx={{lineHeight: 1}} variant="subtitle1">
            Session duration
          </Typography>
          <Timer roomId={roomId} />
        </Box>
        {user?.moderator && (
          <Box className={classes.section}>
            <ModeratorControls
              sessionId={sessionId}
              ended={ended}
              onReleaseModerator={() => updateUser({...user, moderator: false})}
              onSessionEnd={endSession}
              onSessionStart={startSession}
            />
          </Box>
        )}
      </Box>
      <Box flex={1}>
        <Box className={classes.section}>
          <SessionVotesSummary userId={user?.id} users={users} roomId={roomId} />
        </Box>
      </Box>

      {isMobileOpen && (
        <>
          <Box flex={0} width={300} className={classes.section}>
            <Typography variant="subtitle1">Invite participants</Typography>
            <InviteUrl value={`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/${roomId}`} />
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
    </Box>
  );
};

export default RoomDetails;
