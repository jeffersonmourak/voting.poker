import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { IconButton, styled, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  gap: theme.spacing(1),
}));

const UrlWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1, 2),
  height: theme.spacing(6),
  display: 'flex',
  alignItems: 'center',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
}));

interface InviteUrlProps {
  value: string;
}

export const InviteUrl = ({ value }: InviteUrlProps) => {
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

  const handleSelect: React.MouseEventHandler<HTMLDivElement> = ({ target }) => {
    window.getSelection()?.selectAllChildren(target as Node);
    handleCopy();
  };

  return (
    <Root>
      <Tooltip open={copied} title="Copied to clipboard">
        <UrlWrapper onClick={handleSelect}>
          {value}
        </UrlWrapper>
      </Tooltip>
      <IconButton onClick={handleCopy} color="secondary">
        <ContentCopyRoundedIcon />
      </IconButton>
    </Root>
  );
};
