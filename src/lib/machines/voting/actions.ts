import type { User, VotingContext } from "./context";
import { type Events, VotingEvents } from "./events";

export const COMPUTE_VOTE_ACTION_KEY = "action:compute:vote" as const;
export const REGISTER_USER_ACTION_KEY = "action:user:register" as const;
export const UPDATE_USER_ACTION_KEY = "action:user:update" as const;
export const REMOVE_USER_ACTION_KEY = "action:user:remove" as const;
export const CLEAR_POOL_ACTION_KEY = "action:clear:pool" as const;
export const MODEATOR_SYNC_VOTES_ACTION_KEY =
  "action:moderator:votes-sync" as const;

export type COMPUTE_VOTE_ACTION_KEY_Type = typeof COMPUTE_VOTE_ACTION_KEY;
export type REGISTER_USER_ACTION_KEY_Type = typeof REGISTER_USER_ACTION_KEY;
export type UPDATE_USER_ACTION_KEY_Type = typeof UPDATE_USER_ACTION_KEY;
export type REMOVE_USER_ACTION_KEY_Type = typeof REMOVE_USER_ACTION_KEY;
export type CLEAR_POOL_ACTION_KEY_Type = typeof CLEAR_POOL_ACTION_KEY;
export type MODEATOR_SYNC_VOTES_ACTION_KEY_Type =
  typeof MODEATOR_SYNC_VOTES_ACTION_KEY;

export type Actions =
  | COMPUTE_VOTE_ACTION_KEY_Type
  | REGISTER_USER_ACTION_KEY_Type
  | UPDATE_USER_ACTION_KEY_Type
  | REMOVE_USER_ACTION_KEY_Type
  | CLEAR_POOL_ACTION_KEY_Type
  | MODEATOR_SYNC_VOTES_ACTION_KEY_Type;

export const computeVoteActionAssign = {
  votes: ({ event, context }: { event: Events; context: VotingContext }) => {
    if (event.type !== VotingEvents.Vote) {
      return context.votes;
    }

    const { votes: oldVotes } = context;
    const { vote } = event;

    return {
      ...oldVotes,
      [event.createdBy]: vote,
    };
  },
};

export const registerUserActionAssign = {
  users: ({ event, context }: { event: Events; context: VotingContext }) => {
    if (event.type !== VotingEvents.RegisterUser) {
      return context.users;
    }

    const { users: oldUsers } = context;
    const { user } = event;

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
};

export const updateUserActionAssign = {
  users: ({ event, context }: { event: Events; context: VotingContext }) => {
    if (event.type !== VotingEvents.UpdateUser) {
      return context.users;
    }

    const { users: oldUsers } = context;
    const { id, payload } = event;

    return oldUsers.map((u: User) => (u.id === id ? { ...u, ...payload } : u));
  },
};

export const removeUserActionAssign = {
  users: ({ event, context }: { event: Events; context: VotingContext }) => {
    if (event.type !== VotingEvents.RemoveUser) {
      return context.users;
    }
    const { users: oldUsers } = context;
    const { user } = event;

    return oldUsers.filter((u: User) => u.id !== user.id);
  },
};

export const clearPoolActionAssign = {
  votes: ({
    event,
    context,
  }: {
    event: Events;
    context: VotingContext;
  }) => ({}),
};

export const moderatorSyncVotesAction = {
  votes: ({ event, context }: { event: Events; context: VotingContext }) => {
    if (event.type !== VotingEvents.ModeratorSync) {
      return context.votes;
    }

    return event.votes;
  },
};
