import React, {useEffect, useState} from 'react';
import {IconButton, Theme, Tooltip} from '@mui/material';
import {Box} from '@mui/system';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    gap: theme.spacing(1),
  },
  url: {
    flex: 1,
    padding: theme.spacing(1, 2),
    height: theme.spacing(6),
    display: 'flex',
    alignItems: 'center',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
}));

interface InviteUrlProps {
  value: string;
}

export const InviteUrl = ({value}: InviteUrlProps) => {
  const classes = useStyles();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopied(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  const handleCopy = () => {
    window.navigator.clipboard.writeText(value);
    setCopied(true);
  };

  const handleSelect: React.MouseEventHandler<HTMLDivElement> = ({target}) => {
    window.getSelection()?.selectAllChildren(target as Node);
    handleCopy();
  };

  return (
    <Box className={classes.root}>
      <Tooltip open={copied} title="Copied to clipboard">
        <Box onClick={handleSelect} className={classes.url}>
          {value}
        </Box>
      </Tooltip>
      <IconButton onClick={handleCopy} color="secondary">
        <ContentCopyRoundedIcon />
      </IconButton>
    </Box>
  );
};
