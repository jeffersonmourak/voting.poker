import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {avatarProps} from '@root/helpers/avatarProps';
import {Button, Theme, Tooltip, Typography, TextField, Popover} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import {BaseEmoji, Picker} from 'emoji-mart';

import {User} from '@root/types/User';
import {FileUploader} from './FileUploader';
import {GiphySearch} from './GiphySearch';
import Image from 'next/image';
import {AvatarCTA} from './AvatarCTA';
import {useFormControls} from '../hooks/useFormControls';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 128,
    height: 128,
    color: theme.palette.common.white,
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    ['&:hover']: {
      opacity: 1,
    },
  },
  icon: {
    fontSize: '3rem',
  },
  modalRoot: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  modalPaper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 4, 4, 4),
    width: 700,
    overflow: 'auto',
    gap: theme.spacing(2),
    backgroundColor: '#191919',
  },

  fileUploader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    cursor: 'pointer',
    ['&:hover']: {
      backgroundColor: theme.palette.action.hover,
    },
  },
  fileDragging: {
    backgroundColor: theme.palette.action.hover,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  poweredByGiphy: {
    backgroundColor: theme.palette.common.black,
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(1)} !important`,
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
  },
  emojiButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.palette.success.main,
    padding: theme.spacing(1),
    minWidth: 0,
    fontSize: theme.typography.h5.fontSize,
    width: theme.spacing(6),
    height: theme.spacing(6),

    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },

  username: {
    display: 'flex',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));

interface AvatarPickerProps {
  value: string;
  user: User;
  emoji: string;
  hideDisable?: boolean;
  title?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onChange: (value: Partial<User>) => void;
}

export const AvatarEditorModal = ({
  value,
  user,
  emoji,
  hideDisable = false,
  title = 'Choose your new avatar',
  open,
  setOpen,
  onChange,
}: AvatarPickerProps) => {
  const [data, {updateField, updateFieldString}] = useFormControls(user);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const classes = useStyles();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleSelect = () => {
    onChange(data);
    handleClose();
  };

  const emojiPickerOpen = Boolean(anchorEl);
  const id = emojiPickerOpen ? 'emoji-popover' : undefined;

  const handleEmojiPickerClose = () => {
    setAnchorEl(null);
  };

  const onClickEmoji = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Box className={classes.root}>
        <Avatar {...avatarProps(user.name, value, {width: 128, height: 128, fontSize: '4rem'})} />
        <AvatarCTA disabled={open}>
          <IconButton onClick={handleOpen} className={classes.editButton}>
            <EditRoundedIcon className={classes.icon} />
          </IconButton>
        </AvatarCTA>
        <Tooltip title="Pick your emoji">
          <Button className={classes.emojiButton} variant="text">
            {emoji}
          </Button>
        </Tooltip>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={hideDisable}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box className={classes.modalRoot}>
          <Paper className={classes.modalPaper} elevation={12}>
            <Typography py={3} id="modal-modal-title" variant="h5" component="h2">
              <strong>{title}</strong>
            </Typography>
            <FileUploader
              onClickEmoji={onClickEmoji}
              user={data}
              value={data.avatar}
              onChange={updateFieldString('avatar')}
            />
            <Box className={classes.username}>
              <TextField
                label="Name"
                onChange={updateField('name', true)}
                fullWidth
                value={data.name}
              />
            </Box>
            <Typography
              id="modal-modal-title"
              variant="h6"
              sx={{
                alignSelf: 'stretch',
                leadingTrim: 'both',
                textEdge: 'cap',
                fontFamily: 'Mont',
                fontSize: '12px !important',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '104.313% /* 12.518px */',
              }}
              component="h2">
              Or search and pick a gif below as profile avatar
            </Typography>
            <GiphySearch
              avatarUrl={data.avatar}
              onSelect={(url: string | null) => updateFieldString('avatar')(url || '')}
            />
            <Box className={classes.footer}>
              <Image
                className={classes.poweredByGiphy}
                objectFit="contain"
                src={'/PoweredBy_Giphy.gif'}
                alt="Powered By Giphy"
                width={200}
                height={30}
              />
              <Box className={classes.footerActions}>
                {!hideDisable && (
                  <Button onClick={() => setOpen(false)} variant="contained">
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSelect} variant="contained" color="secondary">
                  Save
                </Button>
              </Box>
            </Box>
            <Popover
              id={id}
              open={emojiPickerOpen}
              anchorEl={anchorEl}
              onClose={handleEmojiPickerClose}
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
                  handleEmojiPickerClose();
                }}
              />
            </Popover>
          </Paper>
        </Box>
      </Modal>
    </>
  );
};
