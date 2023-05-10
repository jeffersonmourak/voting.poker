import {Box, Theme, Typography} from '@mui/material';
import React, {useState, useEffect} from 'react';
import {DateTime, Interval} from 'luxon';
import makeStyles from '@mui/styles/makeStyles';
import UserVote from './UserVote';
import {User} from '@root/types/User';
import {useSession} from '../hooks/useSession';

const useStyles = makeStyles((theme: Theme) => ({
  users: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2),
    gap: theme.spacing(2),
  },
  container: {
    display: 'flex',
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));

interface SessionVotesSummaryProps {
  roomId: string;
  users: User[];
}

const niceDigits = (n?: number) => {
  if (!n) {
    return '00';
  }

  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
};

const SessionVotesSummary = ({roomId, users}: SessionVotesSummaryProps) => {
  const [since, setSince] = useState(Interval.fromDateTimes(DateTime.now(), DateTime.now()));
  const {session, votes} = useSession(roomId);
  const classes = useStyles();

  const {revealed, timestamp} = session ?? {revealed: false, timestamp: new Date()};

  useEffect(() => {
    const timer = setInterval(() => {
      if (!revealed) {
        setSince(Interval.fromDateTimes(timestamp, DateTime.now()));
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [timestamp]);

  const duration = since.toDuration(['hour', 'minute', 'second', 'millisecond']).toObject();

  return (
    <Box className={classes.container}>
      <Box>
        <Typography variant="h5">
          {niceDigits(duration.hours)}:{niceDigits(duration.minutes)}:{niceDigits(duration.seconds)}
        </Typography>
      </Box>
      <Box className={classes.users}>
        {users?.map((user) => (
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
