import {useEffect, useState} from 'react';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import {FileUploader as DragAndDropFiles} from 'react-drag-drop-files';
import makeStyles from '@mui/styles/makeStyles';
import {cx} from '@emotion/css';
import {Theme, Typography} from '@mui/material';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {toBase64} from '@root/helpers/toBase64';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    cursor: 'pointer',
    height: 120,
    ['&:hover']: {
      backgroundColor: theme.palette.action.hover,
    },
  },
  dragging: {
    backgroundColor: theme.palette.action.hover,
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
}));

const IdleMessage = () => {
  return (
    <>
      <AddAPhotoRoundedIcon />
      <Typography variant="body1" component="span">
        Upload a new avatar
      </Typography>
      <Typography variant="caption" component="span">
        Click or drop here
      </Typography>
    </>
  );
};

const DraggingMessage = () => {
  return (
    <>
      <FileUploadRoundedIcon />
      <Typography variant="body1" component="span">
        Drop to upload
      </Typography>
    </>
  );
};

const Preview = ({
  src,
  onClick,
  className,
}: {
  className: string;
  src: string;
  onClick: () => void;
}) => {
  return (
    <Box className={className}>
      <Avatar variant="rounded" src={src} sx={{width: 128, height: 128}} />
      <Tooltip title="Clear avatar">
        <IconButton onClick={onClick}>
          <DeleteRoundedIcon color="error" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

interface FileUploaderProps {
  value: string | null;
  onChange: (file: string) => void;
}
export const FileUploader = ({value, onChange}: FileUploaderProps) => {
  const classes = useStyles();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [draggingFile, setDraggingFile] = useState(false);

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
          className={classes.previewBox}
          onClick={() => handleChange(null)}
          src={uploadedFile}
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
      types={['JPEG', 'PNG', 'GIF']}>
      <Paper className={cx(classes.root, {[classes.dragging]: draggingFile})} variant="outlined">
        {draggingFile ? <DraggingMessage /> : <IdleMessage />}
      </Paper>
    </DragAndDropFiles>
  );
};
