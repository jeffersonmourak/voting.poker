import {Button, CircularProgress} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import useAddRoom from '@root/shared/hooks/useAddRoom';
import useRoomSummary from '@root/shared/hooks/useRoomSummary';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';

const useStyle = makeStyles((theme: Theme) => ({
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
}));

const CreateRoomButton = () => {
    const classes = useStyle();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {room, addRoom, error, reset} = useAddRoom();
    const {loading: loadingRoomData, roomExists} = useRoomSummary(room?.id || '');

    const isRoomLoaded = room?.id && !loadingRoomData && roomExists;

    useEffect(() => {
        if (isRoomLoaded) {
            router.push(`/${room.id}`);
            reset();
        }
    }, [isRoomLoaded, room]);

    useEffect(() => {
        if (error) {
            setLoading(false);
        }
    }, [error]);

    const handleCreateRoom = () => {
        setLoading(true);
        addRoom();
    };

    return (
        <Button variant="contained" color="secondary" disabled={loading} onClick={handleCreateRoom}>
            <Box className={classes.button}>
                {loading ? (
                    <>
                        Creating...
                        <CircularProgress size={20} variant="indeterminate" />
                    </>
                ) : (
                    <>
                        Create a room
                        <ArrowIcon color="#000" />
                    </>
                )}
            </Box>
        </Button>
    );
};

export default CreateRoomButton;
