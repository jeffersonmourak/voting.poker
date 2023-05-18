import {usePresence} from '@ably-labs/react-hooks';
import {useAbly} from './useAbly';
import {useSession} from './useSession';
import {User} from '@root/types/User';
import {identify} from '../analytics';

const defaultUser: User = {
  id: '',
  name: '',
  moderator: false,
  emoji: '🙈',
  avatar: '',
};

export const useRoom = (roomId: string) => {
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
    identify({...newUser, id: clientId, roomId});
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
