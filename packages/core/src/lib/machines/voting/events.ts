import { User } from './context';
import { VotingStates } from './states';

type Id<T> = T extends infer U ? {[K in keyof U]: U[K]} : never;

export type BaseEvent<N, T extends Record<string, any> = {}> = Id<{type: N; createdBy: string} & T>;

export enum VotingEvents {
  StartPool = 'event:pool:start',
  EndPool = 'event:pool:end',
  Vote = 'event:pool:vote',
  RegisterUser = 'event:user:register',
  UpdateUser = 'event:user:update',
  RemoveUser = 'event:user:remove',
  ModeratorSync = 'event:user:moderatorSync',
}

export type VoteEventPayload = {vote: string};
export type RegisterUserEventPayload = {user: User};
export type UpdateUserEventPayload = {id: string; payload: Partial<User>};
export type RemoveUserEventPayload = {user: User};
export type ModeratorSyncEventPayload = {
  state: VotingStates;
  votes: Record<string, string>;
  target: string;
};

export type EventsPayload =
  | VoteEventPayload
  | RegisterUserEventPayload
  | UpdateUserEventPayload
  | RemoveUserEventPayload
  | ModeratorSyncEventPayload;

export type VoteEvent = BaseEvent<VotingEvents.Vote, VoteEventPayload>;
export type EndVoteEvent = BaseEvent<VotingEvents.EndPool>;
export type StartVoteEvent = BaseEvent<VotingEvents.StartPool>;
export type RegisterUserEvent = BaseEvent<VotingEvents.RegisterUser, RegisterUserEventPayload>;
export type UpdateUserEvent = BaseEvent<VotingEvents.UpdateUser, UpdateUserEventPayload>;
export type RemoveUserEvent = BaseEvent<VotingEvents.RemoveUser, RemoveUserEventPayload>;
export type ModeratorSyncEvent = BaseEvent<VotingEvents.ModeratorSync, ModeratorSyncEventPayload>;

export type Events =
  | VoteEvent
  | EndVoteEvent
  | StartVoteEvent
  | RegisterUserEvent
  | RemoveUserEvent
  | UpdateUserEvent
  | ModeratorSyncEvent;
