import { assign } from 'xstate';
import { User, VotingContext } from './context';
import { Events, VotingEvents } from './events';

export const COMPUTE_VOTE_ACTION_KEY = 'action:compute:vote' as const;
export const REGISTER_USER_ACTION_KEY = 'action:user:register' as const;
export const UPDATE_USER_ACTION_KEY = 'action:user:update' as const;
export const REMOVE_USER_ACTION_KEY = 'action:user:remove' as const;
export const CLEAR_POOL_ACTION_KEY = 'action:clear:pool' as const;

export type COMPUTE_VOTE_ACTION_KEY_Type = typeof COMPUTE_VOTE_ACTION_KEY;
export type REGISTER_USER_ACTION_KEY_Type = typeof REGISTER_USER_ACTION_KEY;
export type UPDATE_USER_ACTION_KEY_Type = typeof UPDATE_USER_ACTION_KEY;
export type REMOVE_USER_ACTION_KEY_Type = typeof REMOVE_USER_ACTION_KEY;
export type CLEAR_POOL_ACTION_KEY_Type = typeof CLEAR_POOL_ACTION_KEY;

export const computeVoteAction = assign<VotingContext, Events>({
  votes: ({event, context}) => {
    if (event.type !== VotingEvents.Vote) {
      return context.votes;
    }

    const {votes: oldVotes} = context;
    const {vote} = event;

    return {
      ...oldVotes,
      [event.createdBy]: vote,
    };
  },
});

export const registerUserAction = assign<VotingContext, Events>({
  users: ({event, context}) => {
    if (event.type !== VotingEvents.RegisterUser) {
      return context.users;
    }

    const {users: oldUsers} = context;
    const {user} = event;

    const userExists = oldUsers.find((u: User) => u.id === user.id);
    const moderatorId = oldUsers.find((u: User) => u.moderator)?.id;

    if (!!moderatorId && user.moderator && moderatorId !== user.id) {
      user.moderator = false;
    }

    if (userExists) {
      return oldUsers;
    }

    return [...oldUsers, user];
  },
});

export const updateUserAction = assign<VotingContext, Events>({
  users: ({event, context}) => {
    if (event.type !== VotingEvents.UpdateUser) {
      return context.users;
    }

    const {users: oldUsers} = context;
    const {id, payload} = event;

    return oldUsers.map((u: User) => (u.id === id ? {...u, ...payload} : u));
  },
});

export const removeUserAction = assign<VotingContext, Events>({
  users: ({event, context}) => {
    if (event.type !== VotingEvents.RegisterUser) {
      return context.users;
    }
    const {users: oldUsers} = context;
    const {user} = event;

    return oldUsers.filter((u: User) => u.id !== user.id);
  },
});

export const clearPoolAction = assign<VotingContext, Events>({
  votes: () => ({}),
});
