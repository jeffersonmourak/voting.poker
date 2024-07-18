import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import { Button, styled, Tooltip, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { User } from '@voting.poker/core';
import { avatarProps } from '@voting.poker/next/helpers/avatarProps';
import { toBase64 } from '@voting.poker/next/helpers/toBase64';
import React, { useEffect, useState } from 'react';
import { FileUploader as DragAndDropFiles } from 'react-drag-drop-files';
import { AvatarCTA } from './AvatarCTA';

const RootPaper = styled(Paper)<{ ['data-is-dragging']: boolean }>(({ theme, ['data-is-dragging']: isDragging }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  cursor: 'pointer',
  gap: theme.spacing(2),
  ...(isDragging && { backgroundColor: theme.palette.action.hover, })
}))

const RootBox = styled(Box)<{ ['data-is-dragging']: boolean }>(({ theme, ['data-is-dragging']: isDragging }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  cursor: 'pointer',
  gap: theme.spacing(2),
  ...(isDragging && { backgroundColor: theme.palette.action.hover, })
}))

const EditButton = styled(IconButton)(({ theme }) => ({
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
}));

const UploadFileIcon = styled(FileUploadRoundedIcon)(({ theme }) => ({
  fontSize: '3rem',
}));

const DeleteIcon = styled(DeleteRoundedIcon)(({ theme }) => ({
  fontSize: '3rem',
}));

const EditIcon = styled(EditRoundedIcon)(({ theme }) => ({
  fontSize: '3rem',
}));

const EmojiButton = styled(Button)(({ theme }) => ({
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
}));

const DraggingMessage = ({ user }: { user: User }) => {
  return (
    <>
      <Box>
        <Box display={'block'} position={'relative'}>
          <Avatar
            {...avatarProps(user.name, user.avatar, { width: 128, height: 128, fontSize: '4rem' })}
          />
          <AvatarCTA disabled>
            <EditButton
              disabled
              style={{ opacity: 1, backgroundColor: 'white' }}>
              <UploadFileIcon />
            </EditButton>
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
  return (
    <>
      <Box display={'block'} position={'relative'}>
        <Avatar
          {...avatarProps(user.name, user.avatar, { width: 128, height: 128, fontSize: '4rem', fontWeight: '700', paddingTop: 1, fontFamily: 'inherit' })}
        />
        <AvatarCTA disabled>
          <EditButton onClick={onClick}>
            {!!user.avatar && <DeleteIcon />}
            {!user.avatar && <EditIcon />}
          </EditButton>
        </AvatarCTA>
        <Tooltip title="Pick your emoji">
          <EmojiButton
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClickEmoji(event);
            }}
            variant="text">
            {user.emoji}
          </EmojiButton>
        </Tooltip>
      </Box>
      <Typography variant="body1" component="span" sx={{ textAlign: 'center' }}>
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
export const FileUploader = ({ value, user, onChange, onClickEmoji }: FileUploaderProps) => {
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
      <RootPaper data-is-dragging={draggingFile} variant="outlined">
        <Preview
          onHoverChange={setUploadDisabled}
          onClickEmoji={onClickEmoji}
          onClick={() => handleChange(null)}
          user={{ ...user, avatar: uploadedFile }}
        />
      </RootPaper>
    );
  }

  return (
    <DragAndDropFiles
      multiple={false}
      handleChange={handleUpload}
      dropMessageStyle={{ display: 'none' }}
      onDraggingStateChange={setDraggingFile}
      name="avatar"
      types={['JPEG', 'PNG', 'GIF']}
      disabled={uploadDisabled}
      onClick={() => handleChange(null)}>
      <RootBox data-is-dragging={draggingFile}>
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
      </RootBox>
    </DragAndDropFiles>
  );
};
