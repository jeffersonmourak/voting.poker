import React, {useEffect, useState} from 'react';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import {FileUploader as DragAndDropFiles} from 'react-drag-drop-files';
import makeStyles from '@mui/styles/makeStyles';
import {cx} from '@emotion/css';
import {Theme, Typography, Tooltip, Button} from '@mui/material';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import {toBase64} from '@root/helpers/toBase64';
import {User} from '@root/types/User';
import {avatarProps} from '@root/helpers/avatarProps';
import {AvatarCTA} from './AvatarCTA';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    cursor: 'pointer',
    gap: theme.spacing(2),
  },
  dragging: {
    backgroundColor: theme.palette.action.hover,
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
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
}));

const DraggingMessage = ({user}: {user: User}) => {
  const classes = useStyles();
  return (
    <>
      <Box>
        <Box display={'block'} position={'relative'}>
          <Avatar
            {...avatarProps(user.name, user.avatar, {width: 128, height: 128, fontSize: '4rem'})}
          />
          <AvatarCTA disabled>
            <IconButton
              disabled
              className={classes.editButton}
              style={{opacity: 1, backgroundColor: 'white'}}>
              <FileUploadRoundedIcon className={classes.icon} />
            </IconButton>
          </AvatarCTA>
        </Box>
      </Box>
      <Typography variant="body1" component="span">
        Drop to upload
      </Typography>
    </>
  );
};

const Preview = ({
  onClick,
  user,
  onClickEmoji,
  onHoverChange,
}: {
  onClick: () => void;
  user: User;
  onHoverChange: React.Dispatch<React.SetStateAction<boolean>>;
  onClickEmoji: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  const classes = useStyles();

  return (
    <>
      <Box display={'block'} position={'relative'}>
        <Avatar
          {...avatarProps(user.name, user.avatar, {width: 128, height: 128, fontSize: '4rem'})}
        />
        <AvatarCTA disabled>
          <IconButton onClick={onClick} className={classes.editButton}>
            {!!user.avatar && <DeleteRoundedIcon className={classes.icon} />}
            {!user.avatar && <EditRoundedIcon className={classes.icon} />}
          </IconButton>
        </AvatarCTA>
        <Tooltip title="Pick your emoji">
          <Button
            className={classes.emojiButton}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClickEmoji(event);
            }}
            variant="text">
            {user.emoji}
          </Button>
        </Tooltip>
      </Box>
      <Typography variant="body1" component="span" sx={{textAlign: 'center'}}>
        Click or drop a picture here to upload
      </Typography>
    </>
  );
};

interface FileUploaderProps {
  value: string | null;
  user: User;
  onChange: (file: string) => void;
  onClickEmoji: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export const FileUploader = ({value, user, onChange, onClickEmoji}: FileUploaderProps) => {
  const classes = useStyles();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [draggingFile, setDraggingFile] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(false);

  const handleChange = (fileUrl: string | null) => {
    onChange(fileUrl ?? '');
    setUploadedFile(fileUrl);
  };

  const handleUpload = async (file: File) => {
    const fileString = await toBase64(file);

    handleChange(fileString);
  };

  useEffect(() => {
    if (!!uploadedFile && value !== uploadedFile) {
      setUploadedFile(null);
    }
  }, [value, setUploadedFile]);

  if (uploadedFile) {
    return (
      <Paper className={cx(classes.root, {[classes.dragging]: draggingFile})} variant="outlined">
        <Preview
          onHoverChange={setUploadDisabled}
          onClickEmoji={onClickEmoji}
          onClick={() => handleChange(null)}
          user={{...user, avatar: uploadedFile}}
        />
      </Paper>
    );
  }

  return (
    <DragAndDropFiles
      multiple={false}
      handleChange={handleUpload}
      dropMessageStyle={{display: 'none'}}
      onDraggingStateChange={setDraggingFile}
      name="avatar"
      types={['JPEG', 'PNG', 'GIF']}
      disabled={uploadDisabled}
      onClick={() => handleChange(null)}>
      <Box className={cx(classes.root, {[classes.dragging]: draggingFile})}>
        {draggingFile ? (
          <DraggingMessage user={user} />
        ) : (
          <Preview
            onHoverChange={setUploadDisabled}
            onClickEmoji={onClickEmoji}
            onClick={() => handleChange(null)}
            user={user}
          />
        )}
      </Box>
    </DragAndDropFiles>
  );
};
