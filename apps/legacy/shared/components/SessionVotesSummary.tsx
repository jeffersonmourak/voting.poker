import { AvatarGroup, Box, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { User } from '@root/types/User';
import { useWindowSize } from '@uidotdev/usehooks';
import { chunk, partition } from 'lodash';
import { useContext } from 'react';
import { useSession } from '../hooks/useSession';
import { AvatarContext } from './AvatarProvider';
import UserVote from './UserVote';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(3),
    flex: 1,
  },
  users: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    gap: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  emptySeat: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
  },
}));

interface SessionVotesSummaryProps {
  roomId: string;
  userId?: string;
  users: User[];
}

const SessionVotesSummary = ({roomId, users, userId}: SessionVotesSummaryProps) => {
  const {session, votes} = useSession(roomId);
  const classes = useStyles();
  const {update: updateAvatarModal} = useContext(AvatarContext);
  const screen = useWindowSize();

  const {revealed} = session ?? {revealed: false};

  const [[currentUser], participants] = partition(users ?? [], (user) => user.id === userId);
  const [firstHalf, secondHalf] = chunk(participants, Math.ceil(participants.length / 2));

  const maxAvatars = Math.floor((screen?.width ?? 0) / 240);

  return (
    <Box className={classes.container}>
      <Box className={classes.users}>
        <AvatarGroup max={maxAvatars}>
          {firstHalf?.map((user) => (
            <UserVote
              key={user.id}
              name={user.name}
              avatar={user.avatar}
              emoji={user.emoji}
              moderator={user.moderator}
              vote={votes[user.id]?.vote}
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
          vote={votes[currentUser?.id]?.vote}
          reveal={revealed}
          onClick={() => updateAvatarModal({open: true})}
        />
        <AvatarGroup max={maxAvatars}>
          {secondHalf?.map((user) => (
            <UserVote
              key={user.id}
              name={user.name}
              avatar={user.avatar}
              emoji={user.emoji}
              moderator={user.moderator}
              vote={votes[user.id]?.vote}
              reveal={revealed}
            />
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  );
};

export default SessionVotesSummary;
