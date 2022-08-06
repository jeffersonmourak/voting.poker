import {Button, Popover, TextField} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import 'emoji-mart/css/emoji-mart.css';
import {BaseEmoji, Picker} from 'emoji-mart';
import useUpdateUser from '../hooks/useUpdateUser';
import {UserContext} from './UserProvider';
import {User} from '@root/types/User';
import {event} from '../analytics';

export interface UserDetailsProps {
    roomId: string;
}

const UserDetails = ({roomId}: UserDetailsProps) => {
    const {user} = useContext(UserContext);
    const [userData, setUserData] = useState({...user, emoji: '🙈'});
    const {updateUser} = useUpdateUser(roomId);

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
        console.log(userData);
        updateUser(userData);
        event({
            action: 'update_user',
        });
    };

    useEffect(() => {
        if (user) {
            setUserData({...user});
        }
    }, [user]);

    return (
        <>
            <TextField
                label="Name"
                onChange={updateField('name')}
                fullWidth
                value={userData?.name}
            />
            <TextField
                label="Avatar"
                onChange={updateField('avatar')}
                fullWidth
                value={userData?.avatar}
            />

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
