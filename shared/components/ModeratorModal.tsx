import {Button, Container, Paper, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import {useContext} from 'react';
import useUpdateUser from '../hooks/useUpdateUser';
import {UserContext} from './UserProvider';

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(6, 4),
        gap: theme.spacing(4),
    },
}));

interface IdentifyProps {
    roomId: string;
}

const ModeratorModal = ({roomId}: IdentifyProps) => {
    const classes = useStyle();
    const {user} = useContext(UserContext);
    const {updateUser} = useUpdateUser(roomId as string);

    return (
        <Box className={classes.root}>
            <Paper>
                <Container className={classes.container} maxWidth="sm">
                    <Typography variant="h5" align="center">
                        Well, seems like the moderator left, but you can still be the moderator!
                    </Typography>
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => updateUser({...user, moderator: true})}>
                        Be the moderator
                    </Button>
                </Container>
            </Paper>
        </Box>
    );
};

export default ModeratorModal;
