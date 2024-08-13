import { Button, Popover, styled, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { useRef, useState } from 'react';

import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import { User } from '@voting.poker/core';
import { useFormControls } from '@voting.poker/next/hooks/useFormControls';
import { useRoom } from '@voting.poker/next/hooks/useRoom';
import Image from 'next/image';
import { FileUploader } from './FileUploader';
import { GiphySearch } from './GiphySearch';
import { useElementScroll } from './NavBar/hooks/useVisibleSection';

const ModalRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  [theme.breakpoints.down('md')]: {
    height: '100%',
    backgroundColor: theme.palette.background.default,
  }
}));

const ModalPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2, 4, 4, 4),
  width: 700,
  overflowY: 'auto',
  overflowX: 'hidden',
  gap: theme.spacing(2),
  backgroundColor: '#191919',

  [theme.breakpoints.down('md')]: {
    backgroundColor: theme.palette.background.default,
    borderRadius: 0,
    width: '100%',
    height: '100%',
  },
}));

const UsernameBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',

  [theme.breakpoints.down('md')]: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: `100%`,
    padding: theme.spacing(2),
    backdropFilter: 'blur(16px)',
  }
}));

const PowerByGiphy = styled(Image)(({ theme }) => ({
  backgroundColor: theme.palette.common.black,
  borderRadius: theme.spacing(2),
  padding: `${theme.spacing(1)} !important`,
}));

const FooterActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}));


interface AvatarPickerProps {
  user: User;
  hideDisable?: boolean;
  title?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  onChange: (value: User) => void;
}

export const AvatarEditorModal = ({
  user,
  hideDisable = false,
  title = 'Choose your new avatar',
  open,
  setOpen,
  onChange,
}: AvatarPickerProps) => {
  const room = useRoom()
  const [data, { updateField, updateFieldString }] = useFormControls(room.state.currentUser);
  const [anchorEl, setAnchorEl] = useState(null);

  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { scrollTop, scrollElement } = useElementScroll(scrollElementRef.current);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleSelect = () => {
    data && onChange(data);
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

  if (!data) {
    return null;
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={hideDisable}
        aria-labelledby="avatar-editor-modal-title">
        <ModalRoot>
          <ModalPaper ref={scrollElementRef} elevation={12} sx={{ maxHeight: '900px', height: '100%' }} >
            <Typography py={3} id="avatar-editor-modal-title" variant="h5" component="h2">
              <strong>{title}</strong>
            </Typography>
            <FileUploader
              onClickEmoji={onClickEmoji}
              user={data}
              value={data.avatar}
              onChange={updateFieldString('avatar')}
            />
            <UsernameBox>
              <TextField
                label="Name"
                onChange={updateField('name', true)}
                fullWidth
                value={data.name}
              />
            </UsernameBox>
            <Typography
              variant="h6"
              sx={{
                alignSelf: 'stretch',
                leadingTrim: 'both',
                textEdge: 'cap',
                fontFamily: ['var(--mont)', 'sans-serif'].join(', '),
                fontSize: '12px !important',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '104.313% /* 12.518px */',
              }}
              component="h6">
              Or search and pick a gif below as profile avatar
            </Typography>
            <GiphySearch
              avatarUrl={data.avatar}
              onSelect={(url: string | null) => updateFieldString('avatar')(url || '')}
            />
            <Footer>
              <PowerByGiphy
                objectFit="contain"
                src={'/PoweredBy_Giphy.gif'}
                alt="Powered By Giphy"
                width={200}
                height={55}
              />
              <FooterActions>
                {isMobile && scrollTop > 490 && (<Tooltip title="Get back to top" placement='top'>
                  <Button sx={{
                    borderRadius: 1,
                  }} onClick={() => scrollElement(0)} variant='contained' color='info'>
                    <ArrowDropUpRoundedIcon />
                  </Button>
                </Tooltip>)}
                {!hideDisable && (
                  <Button onClick={() => setOpen(false)} variant="contained">
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSelect} variant="contained" color="secondary">
                  Save
                </Button>
              </FooterActions>
            </Footer>
            <Popover
              id={id}
              open={emojiPickerOpen}
              anchorEl={anchorEl}
              onClose={handleEmojiPickerClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}>
              <EmojiPicker
                previewConfig={{
                  defaultCaption: 'This is your emoji now.',
                  defaultEmoji: user.emoji.codePointAt(0)?.toString(16),
                }}
                theme={EmojiTheme.DARK}
                onEmojiClick={(emoji) => {
                  updateFieldString('emoji')(emoji.emoji);
                  handleEmojiPickerClose();
                }}
              />
            </Popover>
          </ModalPaper>
        </ModalRoot>
      </Modal>
    </>
  );
};
