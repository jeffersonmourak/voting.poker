import 'emoji-mart/css/emoji-mart.css';
import {Box, Theme} from '@mui/material';
import React, {useState} from 'react';

import {User} from '@root/types/User';
import {AvatarEditorModal} from './AvatarEditorModal';
import makeStyles from '@mui/styles/makeStyles';
import sillyName from 'sillyname';

const defaultUser: User = {
  id: '',
  name: sillyName(),
  moderator: false,
  emoji: '🙈',
  avatar: '',
};

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  username: {
    display: 'flex',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));

export interface UserDetailsProps {
  user: User | null;
  updateUser: (user: Partial<User>) => void;
}

const UserDetails = ({updateUser, user: rawUser}: UserDetailsProps) => {
  const user = rawUser ?? defaultUser;

  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(true);
  const [userData, setUserData] = useState(user);

  return (
    <Box className={classes.root}>
      <AvatarEditorModal
        open={modalOpen}
        setOpen={setModalOpen}
        emoji={userData?.emoji}
        user={user}
        value={userData?.avatar}
        title={!rawUser ? 'Introduce yourself' : 'Express Yourself!'}
        hideDisable={!rawUser}
        onChange={(data) =>
          setUserData((u) => {
            const newData = {...u, ...data, moderator: user.moderator};

            updateUser(newData);

            return newData;
          })
        }
      />
    </Box>
  );
};

export default UserDetails;
