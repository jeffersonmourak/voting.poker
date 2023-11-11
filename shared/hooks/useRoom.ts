import { usePresence } from '@ably-labs/react-hooks';
import { User } from '@root/types/User';
import sillyName from 'sillyname';
import { identify } from '../analytics';
import { useAbly } from './useAbly';
import { useSession } from './useSession';

const defaultUser: User = {
  id: '',
  name: sillyName(),
  moderator: false,
  emoji: '🙈',
  avatar: '',
};

export const useRoom = (roomId: string) => {
  const {clientId} = useAbly();
  const [presence, updatePresence] = usePresence<User>(roomId);
  const {sessionId, votes, session} = useSession(roomId);

  const clientPresence = presence.find((member) => member.clientId === clientId);

  const user = {...(clientPresence?.data ?? defaultUser), id: clientPresence?.id || ''};
  const users = presence
    .filter((member) => !!member.data)
    .map((member) => ({...member.data, id: member.id}));
  const moderatorSeatOpen = !users.some((user) => user.moderator);

  const updateUser = (value: Partial<User>) => {
    const newUser: User = {
      ...user,
      ...value,
      moderator: value.moderator ?? user.moderator,
    };
    identify({...newUser, id: clientId, roomId});
    updatePresence(newUser);
  };

  return {
    user,
    userId: user.id,
    users,
    updateUser,
    moderatorSeatOpen,
    sessionId,
    ended: session?.revealed ?? false,
    votes,
  };
};
