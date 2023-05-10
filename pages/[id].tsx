import {Box, Grid, Modal} from '@mui/material';
import BasePage from '@root/shared/components/BasePage';
import Cards from '@root/shared/components/Cards';
import Identify from '@root/shared/components/Identify';
import ModeratorModal from '@root/shared/components/ModeratorModal';
import Results from '@root/shared/components/Results';
import RoomDetails from '@root/shared/components/RoomDetails';
import SessionVotesSummary from '@root/shared/components/SessionVotesSummary';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React from 'react';
import Error from './_error';
import {User} from '@root/types/User';
import {useAbly} from '@root/shared/hooks/useAbly';
import {usePresence} from '@ably-labs/react-hooks';

import Lobby from '@root/shared/components/Lobby';
import {useSession} from '@root/shared/hooks/useSession';

interface RoomLayoutProps {
  roomId: string;
}

const defaultUser: User = {
  id: '',
  name: '',
  moderator: false,
  emoji: '🙈',
  avatar: '',
};

const useRoom = (roomId: string) => {
  const {clientId} = useAbly();
  const [presence, updatePresence] = usePresence<User>(roomId);
  const {sessionId, votes, session} = useSession(roomId);

  const user = presence.find((member) => member.clientId === clientId)?.data ?? null;
  const users = presence
    .filter((member) => !!member.data)
    .map((member) => ({...member.data, id: member.clientId}));
  const moderatorSeatOpen = !users.some((user) => user.moderator);

  const updateUser = (value: Partial<User>) => {
    const newUser: User = {
      ...(user ?? defaultUser),
      ...value,
    };

    updatePresence(newUser);
  };

  return {
    user,
    userId: clientId,
    users,
    updateUser,
    moderatorSeatOpen,
    sessionId,
    ended: session?.revealed ?? false,
    votes,
  };
};

const RoomLayout: React.FC<RoomLayoutProps> = ({roomId}) => {
  const {user, userId, users, updateUser, moderatorSeatOpen, sessionId, ended, votes} = useRoom(
    roomId
  );

  if (user === null) {
    return <Identify updateUser={updateUser} />;
  }

  return (
    <BasePage>
      <Modal open={moderatorSeatOpen}>
        <ModeratorModal updateUser={updateUser} roomId={roomId} />
      </Modal>
      <Box px={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SessionVotesSummary users={users} roomId={roomId} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={3} xs={12}>
            <RoomDetails
              user={user}
              updateUser={updateUser}
              sessionId={sessionId}
              ended={ended}
              roomId={roomId}
            />
          </Grid>
          <Grid item md={8} xs={12}>
            {!sessionId && <Lobby roomId={roomId} userId={userId} />}
            {sessionId && !ended && <Cards userId={userId} roomId={roomId} />}
            {ended && <Results votes={votes} />}
          </Grid>
          <Grid item md={1} />
        </Grid>
      </Box>
    </BasePage>
  );
};

const Room: NextPage = () => {
  const router = useRouter();
  const {id} = router.query as {id: string};

  if (!id) {
    return <Error statusCode={404} />;
  }

  return <RoomLayout roomId={id} />;
};

export default Room;
