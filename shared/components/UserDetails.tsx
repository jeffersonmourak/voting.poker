import 'emoji-mart/css/emoji-mart.css';
import {Box, Button, Popover, TextField, Theme, Tooltip} from '@mui/material';
import React, {useState} from 'react';
import {BaseEmoji, Picker} from 'emoji-mart';
import {User} from '@root/types/User';
import {AvatarPicker} from './AvatarPicker';
import makeStyles from '@mui/styles/makeStyles';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

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
  user: User;
  updateUser: (user: Partial<User>) => void;
}

const UserDetails = ({updateUser, user}: UserDetailsProps) => {
  const classes = useStyles();
  const [userData, setUserData] = useState(user);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'emoji-popover' : undefined;

  const updateUserData = () => {
    updateUser({...user, ...userData, moderator: user.moderator});
  };

  const updateFieldString = (field: keyof User, autoSave = true) => (value: string) => {
    setUserData({...userData, [field]: value});
    if (autoSave) {
      updateUser({...user, ...userData, [field]: value, moderator: user.moderator});
    }
  };

  const updateField = (field: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFieldString(field, false)(event.target.value);
  };

  return (
    <Box className={classes.root}>
      <AvatarPicker
        emoji={userData?.emoji}
        onClickEmoji={handleClick}
        user={user}
        value={userData?.avatar}
        onSelect={updateFieldString('avatar')}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        <Picker
          title="Pick your emoji…"
          emoji="point_up"
          theme="dark"
          onClick={(emoji: BaseEmoji) => {
            updateFieldString('emoji')(emoji.native);
            handleClose();
          }}
        />
      </Popover>
      <Box className={classes.username}>
        <TextField label="Name" onChange={updateField('name')} fullWidth value={userData?.name} />
        <Tooltip title="Save your name">
          <Button variant="contained" color="secondary" onClick={updateUserData}>
            <SaveRoundedIcon />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default UserDetails;
