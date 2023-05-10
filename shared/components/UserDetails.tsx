import 'emoji-mart/css/emoji-mart.css';
import {Button, Popover, TextField} from '@mui/material';
import React, {useState} from 'react';
import {BaseEmoji, Picker} from 'emoji-mart';
import {User} from '@root/types/User';
import {event} from '../analytics';
import {AvatarPicker} from './AvatarPicker';

export interface UserDetailsProps {
  user: User;
  updateUser: (user: Partial<User>) => void;
}

const UserDetails = ({updateUser, user}: UserDetailsProps) => {
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

  const updateFieldString = (field: keyof User) => (value: string) => {
    setUserData({...userData, [field]: value});
  };

  const updateField = (field: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFieldString(field)(event.target.value);
  };

  const updateUserData = () => {
    updateUser({...user, ...userData, moderator: user.moderator});
    event({
      action: 'update_user',
    });
  };

  return (
    <>
      <AvatarPicker user={user} value={userData?.avatar} onSelect={updateFieldString('avatar')} />
      <TextField label="Name" onChange={updateField('name')} fullWidth value={userData?.name} />
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        Your Emoji: {userData?.emoji}
      </Button>
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

      <Button variant="contained" color="secondary" onClick={updateUserData}>
        Save
      </Button>
    </>
  );
};

export default UserDetails;
