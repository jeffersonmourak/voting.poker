import {Button, TextField, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import React, {useState} from 'react';
import {User} from '@root/types/User';

const useStyle = makeStyles((theme: Theme) => ({
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 0, 6),
    gap: theme.spacing(4),
  },
  action: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

interface IdentifyProps {
  updateUser: (value: Partial<User>) => void;
}

const Identify = ({updateUser}: IdentifyProps) => {
  const [username, setUsername] = useState('');

  const classes = useStyle();

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUser({name: username});
  };

  return (
    <Box className={classes.content}>
      <Box className={classes.hero}>
        {username && <Typography variant="h4">Nice to meet you</Typography>}
        {!username && <Typography variant="h4">Identify yourself!</Typography>}
      </Box>
      <Box className={classes.action}>
        <form onSubmit={handleSubmit}>
          <TextField color="primary" label="Your name" onChange={handleTextChange} />
          <Button variant="contained" type="submit" onClick={() => null}>
            <Box className={classes.button}>
              Join
              <ArrowIcon />
            </Box>
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Identify;
