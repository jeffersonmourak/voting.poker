import {Box, Theme} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import useVotesSummary from '../hooks/useVotesSummary';
import UserVote from './UserVote';

const useStyles = makeStyles((theme: Theme) => ({
    users: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: theme.spacing(2, 0, 2),
    },
}));

interface SessionVotesSummaryProps {
    roomId: string;
}

const SessionVotesSummary = ({roomId}: SessionVotesSummaryProps) => {
    const {users, reveal} = useVotesSummary(roomId);
    const classes = useStyles();

    return (
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
    );
};

export default SessionVotesSummary;
