import {Button, CircularProgress} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import useAddRoom from '@root/shared/hooks/useAddRoom';
import {useRouter} from 'next/router';
import {useAnalytics} from '../hooks/useAnalytics';

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
  const {event} = useAnalytics();
  const {room, addRoom, error, loading} = useAddRoom();

  console.log({
    room,
    loading,
    error,
  });

  const handleCreateRoom = () => {
    addRoom();
    event({
      action: 'create_room',
    });
  };

  if (loading) {
    <Button variant="contained" color="secondary" disabled={loading} onClick={handleCreateRoom}>
      <Box className={classes.button}>
        Creating...
        <CircularProgress size={20} variant="indeterminate" />
      </Box>
    </Button>;
  }

  if (!room) {
    return (
      <Button variant="contained" color="secondary" disabled={loading} onClick={handleCreateRoom}>
        <Box className={classes.button}>
          Create a room
          <ArrowIcon color="#000" />
        </Box>
      </Button>
    );
  }

  router.push(`/${room.id}`);
  return null;
};

export default CreateRoomButton;
