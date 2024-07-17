import { useRoom } from '@/hooks/useRoom';
import { AvatarGroup, Box, styled } from '@mui/material';
import { useWindowSize } from '@uidotdev/usehooks';
import { User } from 'core';
import { chunk, partition } from 'lodash';
import { useContext } from 'react';
import { AvatarContext } from './AvatarProvider';
import UserVote from './UserVote';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: theme.spacing(3),
  flex: 1,
  marginTop: '15px',
}));

const UsersList = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  gap: theme.spacing(1),
  justifyContent: 'center',
  alignItems: 'flex-start',
}));

interface SessionVotesSummaryProps {
  userId?: string;
  users: User[];
}

const SessionVotesSummary = ({ users, userId }: SessionVotesSummaryProps) => {
  const { update: updateAvatarModal } = useContext(AvatarContext);
  const screen = useWindowSize();
  const room = useRoom();

  const [[currentUser], participants] = partition(users ?? [], (user) => user.id === userId);
  const [firstHalf, secondHalf] = chunk(participants, Math.ceil(participants.length / 2));

  const maxAvatars = Math.floor((screen?.width ?? 0) / 240);

  const revealed = false;
  const votes = room.state.votes

  return (
    <Root>
      <UsersList>
        <AvatarGroup max={maxAvatars}>
          {firstHalf?.map((user) => (
            <UserVote
              key={user.id}
              name={user.name}
              avatar={user.avatar}
              emoji={user.emoji}
              moderator={user.moderator}
              vote={votes[user.id]}
              reveal={revealed}
            />
          ))}
        </AvatarGroup>
        <UserVote
          key={currentUser?.id}
          displayYouTag
          name={`${currentUser?.name}`}
          avatar={currentUser?.avatar}
          emoji={currentUser?.emoji}
          moderator={currentUser?.moderator}
          vote={votes[currentUser?.id]}
          reveal={revealed}
          onClick={() => updateAvatarModal({ open: true })}
        />
        <AvatarGroup max={maxAvatars}>
          {secondHalf?.map((user) => (
            <UserVote
              key={user.id}
              name={user.name}
              avatar={user.avatar}
              emoji={user.emoji}
              moderator={user.moderator}
              vote={votes[user.id]}
              reveal={revealed}
            />
          ))}
        </AvatarGroup>
      </UsersList>
    </Root>
  );
};

export default SessionVotesSummary;
