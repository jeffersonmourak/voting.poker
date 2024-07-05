import { assign } from 'xstate';
import { User, VotingContext } from './context';
import { Events, VotingEvents } from './events';

export const COMPUTE_VOTE_ACTION_KEY = 'action:compute:vote' as const;
export const REGISTER_USER_ACTION_KEY = 'action:user:register' as const;
export const UPDATE_USER_ACTION_KEY = 'action:user:update' as const;
export const REMOVE_USER_ACTION_KEY = 'action:user:remove' as const;
export const CLEAR_POOL_ACTION_KEY = 'action:clear:pool' as const;

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

    const userExists = oldUsers.find((u: User) => u.name === user.name);
    const moderatorName = oldUsers.find((u: User) => u.moderator)?.name;

    if (!!moderatorName && user.moderator && moderatorName !== user.name) {
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
    const {name, payload} = event;

    return oldUsers.map((u: User) => (u.name === name ? {...u, ...payload} : u));
  },
});

export const removeUserAction = assign<VotingContext, Events>({
  users: ({event, context}) => {
    if (event.type !== VotingEvents.RegisterUser) {
      return context.users;
    }
    const {users: oldUsers} = context;
    const {user} = event;

    return oldUsers.filter((u: User) => u.name !== user.name);
  },
});

export const clearPoolAction = assign<VotingContext, Events>({
  votes: () => ({}),
});
