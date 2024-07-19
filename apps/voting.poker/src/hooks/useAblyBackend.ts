import {
  Events,
  REGISTER_USER_ACTION_KEY,
  REGISTER_USER_ACTION_KEY_Type,
  REMOVE_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY_Type,
  UPDATE_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY_Type,
  User,
  VotingEvents,
} from '@voting.poker/core';
import {
  BaseRealtime,
  FetchRequest,
  RealtimePresence,
  WebSocketTransport,
} from 'ably/modular';
import { useEffect, useMemo } from 'react';
import sillyname from 'sillyname';
import { v4 as uuidV4 } from 'uuid';

const DefaultUser: User = {
  id: uuidV4(),
  name: sillyname(),
  avatar: '',
  emoji: '🙈',
  moderator: false,
  vote: null,
};

const ablyClient = new BaseRealtime({
  key: process.env.NEXT_PUBLIC_ABLY_KEY,
  clientId: DefaultUser.id,
  plugins: {
    WebSocketTransport,
    RealtimePresence,
    FetchRequest,
  },
});

type PresenceAction =
  | REGISTER_USER_ACTION_KEY_Type
  | REMOVE_USER_ACTION_KEY_Type
  | UPDATE_USER_ACTION_KEY_Type;

type PresenceFn = (user: User, action: PresenceAction) => void;

type PoolEventFn = (event: Events) => void;

export function useAblyBackend(
  roomId: string,
  presenceCallback: PresenceFn,
  poolEventCallback: PoolEventFn
) {
  const channel = useMemo(
    () =>
      ablyClient.channels.get(roomId, {
        modes: ['PUBLISH', 'SUBSCRIBE', 'PRESENCE', 'PRESENCE_SUBSCRIBE'],
      }),
    [roomId]
  );

  channel.presence.subscribe(
    ['enter', 'leave', 'present', 'update'],
    (presence) => {
      const id = presence.clientId;
      const userData = presence.data;
      const user: User = { ...userData, id };

      const actionKeys: Record<string, PresenceAction> = {
        present: REGISTER_USER_ACTION_KEY,
        enter: REGISTER_USER_ACTION_KEY,
        update: UPDATE_USER_ACTION_KEY,
        leave: REMOVE_USER_ACTION_KEY,
      };

      if (!actionKeys[presence.action]) {
        return;
      }

      presenceCallback(user, actionKeys[presence.action]);
    }
  );

  useEffect(() => {
    channel.subscribe((message) => {
      const { data, name, clientId } = message;

      if (!clientId) {
        return;
      }

      switch (name) {
        case 'START_SESSION':
          poolEventCallback({
            type: VotingEvents.StartPool,
            createdBy: clientId,
          });
          break;
        case 'END_SESSION':
          poolEventCallback({
            type: VotingEvents.EndPool,
            createdBy: clientId,
          });
          break;
        case 'VOTE':
          poolEventCallback({
            type: VotingEvents.Vote,
            createdBy: clientId,
            vote: data.vote,
          });
          break;
        case 'MODERATOR_SYNC':
          if (data.target === DefaultUser.id) {
            poolEventCallback({
              type: VotingEvents.ModeratorSync,
              createdBy: clientId,
              state: data.state,
              votes: data.votes,
              target: data.target,
            });
          }
          break;
        default:
          break;
      }
    });

    const { id: _, ...presenceUser } = DefaultUser;

    channel.presence.enter(presenceUser);

    return () => {
      channel.presence.leave();
      channel.unsubscribe();
    };
  }, []);

  const publish = (state: Events) => {
    switch (state.type) {
      case VotingEvents.RegisterUser:
        channel.presence.update(DefaultUser);
        break;
      case VotingEvents.UpdateUser:
        channel.presence.update({
          ...DefaultUser,
          ...state.payload,
        });
        break;
      case VotingEvents.RemoveUser:
        channel.presence.leave();
        break;
      case VotingEvents.StartPool:
        channel.publish('START_SESSION', {
          ...state,
          id: roomId,
        });
        break;
      case VotingEvents.EndPool:
        channel.publish('END_SESSION', { ...state, id: roomId });
        break;
      case VotingEvents.Vote:
        channel.publish('VOTE', { userId: DefaultUser.id, ...state });
        break;
      case VotingEvents.ModeratorSync:
        channel.publish('MODERATOR_SYNC', state);
        break;
      default:
        break;
    }
  };

  return {
    user: DefaultUser,
    publish,
  };
}
