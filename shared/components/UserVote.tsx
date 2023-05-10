import {Box, Theme, Avatar, Tooltip, Typography} from '@mui/material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Badge from '@mui/material/Badge';
import {avatarProps} from '@root/helpers/avatarProps';
import {cx} from '@emotion/css';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  vote: {
    backgroundColor: theme.palette.success.main,
    minWidth: theme.spacing(3),
    height: theme.spacing(3),
    padding: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing(1.5),
    transition: theme.transitions.create('transform'),
    transform: `scale(1)`,
  },
  emptyVote: {
    transform: `scale(0)`,
  },
  moderator: {
    backgroundColor: theme.palette.info.dark,
    minWidth: theme.spacing(3),
    height: theme.spacing(3),
    padding: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing(1.5),
    transform: `scale(0.8)`,
  },
}));

interface UserVoteProps {
  name: string;
  vote?: string;
  avatar?: string;
  emoji?: string;
  moderator: boolean;
  reveal: boolean;
}

const ModeratorBadge = ({isModerator}: {isModerator: boolean}) => {
  const classes = useStyles();
  if (!isModerator) {
    return null;
  }

  return (
    <Box className={classes.moderator}>
      <Typography sx={{textAlign: 'center'}} variant="caption">
        👑
      </Typography>
    </Box>
  );
};

const VoteBadge = ({vote, emoji, reveal}: {vote?: string; emoji?: string; reveal: boolean}) => {
  const classes = useStyles();

  return (
    <Box className={cx(classes.vote, {[classes.emptyVote]: !vote})}>
      <Typography sx={{textAlign: 'center'}} variant="body1">
        {reveal ? vote : emoji || '🙈'}
      </Typography>
    </Box>
  );
};

const UserVote = ({name, vote, reveal, avatar, moderator, emoji}: UserVoteProps) => {
  const classes = useStyles();

  if (!name) {
    return null;
  }

  return (
    <Box className={classes.root}>
      <Tooltip title={name}>
        <Badge
          overlap="circular"
          anchorOrigin={{vertical: 'top', horizontal: 'left'}}
          badgeContent={<ModeratorBadge isModerator={moderator} />}>
          <Badge
            overlap="circular"
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            badgeContent={<VoteBadge vote={vote} emoji={emoji} reveal={reveal} />}>
            <Avatar {...avatarProps(name, avatar)} />
          </Badge>
        </Badge>
      </Tooltip>
    </Box>
  );
};

export default UserVote;
