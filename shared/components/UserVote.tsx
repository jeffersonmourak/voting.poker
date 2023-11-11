import {Box, Theme, Avatar, Tooltip, Typography, Button} from '@mui/material';
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
  rootBig: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    margin: theme.spacing(0, 2),
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
  voteBig: {
    transform: `scale(1.3)`,
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
  moderatorBig: {
    transform: `scale(1)`,
  },
}));

interface UserVoteProps {
  name: string;
  vote?: string;
  avatar?: string;
  emoji?: string;
  moderator: boolean;
  reveal: boolean;
  displayYouTag?: boolean;
  onClick?: () => void;
}

const ModeratorBadge = ({
  isModerator,
  variant = 'default',
}: {
  isModerator: boolean;
  variant?: 'default' | 'big';
}) => {
  const classes = useStyles();
  if (!isModerator) {
    return null;
  }

  return (
    <Box className={cx(classes.moderator, {[classes.moderatorBig]: variant === 'big'})}>
      <Typography sx={{textAlign: 'center'}} variant="caption">
        👑
      </Typography>
    </Box>
  );
};

const VoteBadge = ({
  vote,
  emoji,
  reveal,
  variant,
}: {
  vote?: string;
  emoji?: string;
  reveal: boolean;
  variant?: 'default' | 'big';
}) => {
  const classes = useStyles();

  return (
    <Box
      className={cx(classes.vote, {
        [classes.emptyVote]: !!vote,
        [classes.voteBig]: variant === 'big',
      })}>
      <Typography sx={{textAlign: 'center'}} variant="body1">
        {reveal ? vote : emoji || '🙈'}
      </Typography>
    </Box>
  );
};

const VoteLayout = ({
  name,
  vote,
  reveal,
  avatar,
  moderator,
  emoji,
  displayYouTag,
}: UserVoteProps) => {
  const size = displayYouTag ? 57 : 40;

  return (
    <Tooltip title={`${displayYouTag ? '(You) ' : ''}${name}`}>
      <Badge
        overlap="circular"
        anchorOrigin={{vertical: 'top', horizontal: 'left'}}
        badgeContent={
          <ModeratorBadge variant={displayYouTag ? 'big' : 'default'} isModerator={moderator} />
        }>
        <Badge
          overlap="circular"
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          badgeContent={
            <VoteBadge
              variant={displayYouTag ? 'big' : 'default'}
              vote={vote}
              emoji={emoji}
              reveal={reveal}
            />
          }>
          <Avatar {...avatarProps(name, avatar, {width: size, height: size})} />
        </Badge>
      </Badge>
    </Tooltip>
  );
};

const UserVote = ({onClick, name, displayYouTag, ...props}: UserVoteProps) => {
  const classes = useStyles();

  const rootClassName = cx(classes.root, {[classes.rootBig]: displayYouTag});

  if (!name) {
    return null;
  }

  if (onClick) {
    return (
      <Button onClick={onClick} className={rootClassName}>
        <VoteLayout name={name} displayYouTag={displayYouTag} {...props} />
      </Button>
    );
  }

  return (
    <Box className={rootClassName}>
      <VoteLayout name={name} displayYouTag={displayYouTag} {...props} />
    </Box>
  );
};

export default UserVote;
