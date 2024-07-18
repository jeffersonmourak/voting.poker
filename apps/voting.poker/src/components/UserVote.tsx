import { Avatar, Box, Button, styled, Tooltip, Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import { avatarProps } from '@voting.poker/next/helpers/avatarProps';

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

const ModeratorBadgeRoot = styled(Box)<{ big: boolean }>(({ theme, big }) => ({
  backgroundColor: theme.palette.info.dark,
  minWidth: theme.spacing(3),
  height: theme.spacing(3),
  padding: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(1.5),
  transform: big ? `scale(1)` : `scale(0.8)`,
}))

const ModeratorBadge = ({
  isModerator,
  variant = 'default',
}: {
  isModerator: boolean;
  variant?: 'default' | 'big';
}) => {
  if (!isModerator) {
    return null;
  }

  return (
    <ModeratorBadgeRoot big={variant === 'big'}>
      <Typography sx={{ textAlign: 'center' }} variant="caption">
        👑
      </Typography>
    </ModeratorBadgeRoot>
  );
};

const VoteBadgeRoot = styled(Box)<{ emptyVote: boolean, big: boolean }>(({ theme, emptyVote, big }) => ({
  backgroundColor: theme.palette.success.main,
  minWidth: theme.spacing(3),
  height: theme.spacing(3),
  padding: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(1.5),
  transition: theme.transitions.create('transform'),
  transform: emptyVote ? `scale(0)` : big ? `scale(1.3)` : `scale(1)`,
}));

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
  return (
    <VoteBadgeRoot
      emptyVote={!vote}
      big={variant === 'big'}>
      <Typography sx={{ textAlign: 'center' }} variant="body1">
        {reveal ? vote : emoji || '🙈'}
      </Typography>
    </VoteBadgeRoot>
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
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        badgeContent={
          <ModeratorBadge variant={displayYouTag ? 'big' : 'default'} isModerator={moderator} />
        }>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <VoteBadge
              variant={displayYouTag ? 'big' : 'default'}
              vote={vote}
              emoji={emoji}
              reveal={reveal}
            />
          }>
          <Avatar {...avatarProps(name, avatar, { width: size, height: size, })} />
        </Badge>
      </Badge>
    </Tooltip>
  );
};

const UserVoteButton = styled(Button)<{ big?: boolean }>(({ theme, big }) => ({
  position: 'relative',
  width: theme.spacing(big ? 5 : 8),
  height: theme.spacing(big ? 5 : 8),
  ...(big ? { margin: theme.spacing(0, 2), } : {})
}))

const UserVoteBox = styled(Box)<{ big?: boolean }>(({ theme, big }) => ({
  position: 'relative',
  width: theme.spacing(big ? 5 : 8),
  height: theme.spacing(big ? 5 : 8),
  ...(big ? { margin: theme.spacing(0, 2), } : {})
}))

const UserVote = ({ onClick, name, displayYouTag, ...props }: UserVoteProps) => {
  if (!name) {
    return null;
  }

  if (onClick) {
    return (
      <UserVoteButton onClick={onClick} big={displayYouTag} >
        <VoteLayout name={name} displayYouTag={displayYouTag} {...props} />
      </UserVoteButton>
    );
  }

  return (
    <UserVoteBox big={displayYouTag}>
      <VoteLayout name={name} displayYouTag={displayYouTag} {...props} />
    </UserVoteBox>
  );
};

export default UserVote;
