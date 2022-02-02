import {Box, Theme, Typography} from '@mui/material';
import React, {useState, useEffect} from 'react';
import {DateTime, Interval} from 'luxon';
import makeStyles from '@mui/styles/makeStyles';
import useRoomSummary from '../hooks/useRoomSummary';
import UserVote from './UserVote';

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

const SessionVotesSummary = ({roomId}: SessionVotesSummaryProps) => {
    const [since, setSince] = useState(Interval.fromDateTimes(DateTime.now(), DateTime.now()));
    const {users, reveal, startedAt} = useRoomSummary(roomId);
    const classes = useStyles();

    useEffect(() => {
        let timer = setInterval(() => {
            if (!reveal) {
                setSince(Interval.fromDateTimes(startedAt, DateTime.now()));
            }
        }, 100);

        return () => {
            clearInterval(timer);
        };
    }, [startedAt]);

    const duration = since.toDuration(['hour', 'minute', 'second', 'millisecond']).toObject();

    return (
        <Box className={classes.container}>
            <Box>
                <Typography variant="h5">
                    {niceDigits(duration.hours)}:{niceDigits(duration.minutes)}:
                    {niceDigits(duration.seconds)}
                </Typography>
            </Box>
            <Box className={classes.users}>
                {users?.map((user) => (
                    <UserVote
                        name={user.name}
                        moderator={user.moderator}
                        vote={user.vote?.value}
                        reveal={reveal}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default SessionVotesSummary;
