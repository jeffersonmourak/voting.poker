import {Button, CircularProgress, TextField} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import useRoomSummary from '@root/shared/hooks/useRoomSummary';
import {useRouter} from 'next/router';
import {useState} from 'react';

const useStyle = makeStyles((theme: Theme) => ({
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
}));

const JoinRoomInput = () => {
    const classes = useStyle();
    const [roomId, setRoomId] = useState('');
    const router = useRouter();

    const targetRoomId = roomId.length === 7 ? roomId : '';

    const {loading: loadingRoomData, roomExists} = useRoomSummary(targetRoomId || '');

    const handleJoinRoom = () => {
        router.push(`/${targetRoomId}`);
    };

    const loading = loadingRoomData && roomId.length === 7;
    const error = !loading && !roomExists && roomId.length === 7;
    const disabled = loading || roomId.length < 7 || error;

    return (
        <Box>
            <TextField
                color="primary"
                label="Room code"
                error={error}
                disabled={loading}
                inputProps={{
                    maxLength: 7,
                }}
                hiddenLabel
                onChange={(e) => setRoomId(e.target.value)}
                helperText={error ? 'Room does not exist' : ''}
            />
            <Button variant="contained" type="submit" disabled={disabled} onClick={handleJoinRoom}>
                <Box className={classes.button}>
                    {loading ? (
                        <>
                            <CircularProgress color="secondary" size={20} variant="indeterminate" />
                        </>
                    ) : (
                        <>
                            Join
                            <ArrowIcon />
                        </>
                    )}
                </Box>
            </Button>
        </Box>
    );
};

export default JoinRoomInput;
