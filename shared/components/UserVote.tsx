import {Box, Theme, Avatar, Tooltip, Typography} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import stringToColor from '@root/helpers/stringToColor';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        position: 'relative',
        width: theme.spacing(5),
        height: theme.spacing(5),
    },
    vote: {
        position: 'absolute',
        bottom: theme.spacing(-1),
        left: theme.spacing(3),
        backgroundColor: theme.palette.success.main,
        minWidth: theme.spacing(3),
        height: theme.spacing(3),
        padding: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.spacing(1.5),
    },
    moderator: {
        position: 'absolute',
        top: theme.spacing(-2),
        left: theme.spacing(1.2),
        minWidth: theme.spacing(3),
        height: theme.spacing(3),
        padding: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.spacing(1.5),
    },
}));

function stringAvatar(name: string, avatar?: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.charAt(0)}`,
        src: avatar,
        alt: name,
    };
}

interface UserVoteProps {
    name: string;
    vote?: string;
    avatar?: string;
    emoji?: string;
    moderator: boolean;
    reveal: boolean;
}

const UserVote = ({name, vote, reveal, avatar, moderator, emoji}: UserVoteProps) => {
    const classes = useStyles();

    if (!name) {
        return null;
    }

    return (
        <Box className={classes.root}>
            <Tooltip title={name}>
                <Avatar {...stringAvatar(name, avatar)} />
            </Tooltip>
            {vote && (
                <Box className={classes.vote}>
                    <Typography sx={{textAlign: 'center'}} variant="body1">
                        {reveal ? vote : emoji || '🙈'}
                    </Typography>
                </Box>
            )}
            {moderator && (
                <Box className={classes.moderator}>
                    <Typography sx={{textAlign: 'center'}} variant="body1">
                        👑
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default UserVote;
