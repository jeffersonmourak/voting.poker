import {Button, Container, Paper, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import {useContext} from 'react';
import useUpdateUser from '../hooks/useUpdateUser';
import {User} from '@root/types/User';

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
  updateUser: (value: Partial<User>) => void;
}

const ModeratorModal = ({updateUser}: IdentifyProps) => {
  const classes = useStyle();

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
            onClick={() => {
              updateUser({moderator: true});
            }}>
            Be the moderator
          </Button>
        </Container>
      </Paper>
    </Box>
  );
};

export default ModeratorModal;
