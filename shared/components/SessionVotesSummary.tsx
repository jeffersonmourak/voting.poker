import {Box, Theme} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import UserVote from './UserVote';
import {User} from '@root/types/User';
import {useSession} from '../hooks/useSession';
import {partition} from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
  users: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    margin: theme.spacing(2, 0, 2),
    gap: theme.spacing(1),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(3),
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
      <Box className={classes.users}>
        {moderators.length === 0 && <Box className={classes.emptySeat}>?</Box>}
        {moderators.map((user) => (
          <UserVote
            key={user.id}
            name={user.name}
            avatar={user.avatar}
            emoji={user.emoji}
            moderator={user.moderator}
            vote={votes[user.id]?.vote}
            reveal={revealed}
          />
        ))}
        {userList.map((user) => (
          <UserVote
            key={user.id}
            name={user.name}
            avatar={user.avatar}
            emoji={user.emoji}
            moderator={user.moderator}
            vote={votes[user.id]?.vote}
            reveal={revealed}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SessionVotesSummary;
