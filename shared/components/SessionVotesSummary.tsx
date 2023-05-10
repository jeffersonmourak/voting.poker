import {Box, Theme} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import UserVote from './UserVote';
import {User} from '@root/types/User';
import {useSession} from '../hooks/useSession';
import {Timer} from './Timer';
import {partition} from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
  users: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    margin: theme.spacing(2, 0, 2),
    gap: theme.spacing(1),
  },
  moderators: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2),
    gap: theme.spacing(1),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  emptySeat: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
  },
}));

interface SessionVotesSummaryProps {
  roomId: string;
  users: User[];
}

const SessionVotesSummary = ({roomId, users}: SessionVotesSummaryProps) => {
  const {session, votes} = useSession(roomId);
  const classes = useStyles();

  const {revealed} = session ?? {revealed: false};

  const [moderators, userList] = partition(users ?? [], (user) => user.moderator);

  return (
    <Box className={classes.container}>
      <Box>
        <Timer roomId={roomId} />
      </Box>
      <Box className={classes.moderators}>
        {moderators.length === 0 && <Box className={classes.emptySeat}>?</Box>}
        {moderators.map((user) => (
          <UserVote
            key={user.id}
            name={user.name}
            avatar={user.avatar}
            emoji={user.emoji}
            moderator={user.moderator}
            vote={votes[user.id]}
            reveal={revealed}
          />
        ))}
      </Box>
      <Box className={classes.users}>
        {userList.map((user) => (
          <UserVote
            key={user.id}
            name={user.name}
            avatar={user.avatar}
            emoji={user.emoji}
            moderator={user.moderator}
            vote={votes[user.id]}
            reveal={revealed}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SessionVotesSummary;
