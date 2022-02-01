import {Box, Button, Paper, TextField, Theme, Typography} from '@mui/material';
import React, {useContext} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import useEndSession from '../hooks/useUpdateRoom';
import useNewSession from '../hooks/useNewSession';
import {UserContext} from './UserProvider';
import useUpdateUser from '../hooks/useUpdateUser';

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
    roomId: string;
    ended: boolean;
}

const RoomDetails = ({roomId, ended}: RoomDetailsProps) => {
    const classes = useStyles();
    const {user} = useContext(UserContext);
    const {endSession} = useEndSession(roomId);
    const {newSession} = useNewSession(roomId);
    const {updateUser} = useUpdateUser(roomId);

    return (
        <Box className={classes.root}>
            {user?.moderator && (
                <Paper className={classes.section} variant="outlined">
                    <Typography variant="h6">Actions</Typography>
                    {!ended && (
                        <Button variant="contained" color="secondary" onClick={endSession}>
                            End voting
                        </Button>
                    )}
                    {ended && (
                        <Button variant="contained" color="secondary" onClick={newSession}>
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
                <TextField
                    fullWidth
                    value={`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/${roomId}`}
                />
            </Paper>
        </Box>
    );
};

export default RoomDetails;
