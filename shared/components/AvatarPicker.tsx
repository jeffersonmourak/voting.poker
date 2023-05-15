import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {avatarProps} from '@root/helpers/avatarProps';
import {Button, Theme, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';

import {User} from '@root/types/User';
import {useState} from 'react';
import {FileUploader} from './FileUploader';
import {GiphySearch} from './GiphySearch';
import Image from 'next/image';
import {AvatarCTA} from './AvatarCTA';

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
    borderRadius: theme.spacing(5),
    padding: `${theme.spacing(2, 4)} !important`,
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
  },
}));

interface AvatarPickerProps {
  onSelect: (avatar: string) => void;
  value: string;
  user: User;
}

export const AvatarPicker = ({onSelect, value, user}: AvatarPickerProps) => {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(value || null);

  const classes = useStyles();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelect = () => {
    onSelect(avatarUrl || '');
    handleClose();
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
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box className={classes.modalRoot}>
          <Paper className={classes.modalPaper} elevation={12}>
            <Typography py={3} id="modal-modal-title" variant="h5" component="h2">
              <strong>Choose your new avatar</strong>
            </Typography>
            <FileUploader value={avatarUrl} onChange={(url: string) => setAvatarUrl(url)} />
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Or search a gif
            </Typography>
            <GiphySearch
              avatarUrl={avatarUrl}
              onSelect={(url: string | null) => setAvatarUrl(url || '')}
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
                <Button onClick={() => setOpen(false)} variant="contained">
                  Cancel
                </Button>
                <Button onClick={handleSelect} variant="contained" color="secondary">
                  Save
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </>
  );
};
