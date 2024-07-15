import { User } from './context';

type Id<T> = T extends infer U ? {[K in keyof U]: U[K]} : never;

export type BaseEvent<N, T extends Record<string, any> = {}> = Id<{type: N; createdBy: string} & T>;

export enum VotingEvents {
  StartPool = 'event:pool:start',
  EndPool = 'event:pool:end',
  Vote = 'event:pool:vote',
  RegisterUser = 'event:user:register',
  UpdateUser = 'event:user:update',
  RemoveUser = 'event:user:remove',
}

export type VoteEventPayload = {vote: string};
export type RegisterUserEventPayload = {user: User};
export type UpdateUserEventPayload = {id: string; payload: Partial<User>};
export type RemoveUserEventPayload = {user: User};

export type EventsPayload =
  | VoteEventPayload
  | RegisterUserEventPayload
  | UpdateUserEventPayload
  | RemoveUserEventPayload;

export type VoteEvent = BaseEvent<VotingEvents.Vote, VoteEventPayload>;
export type EndVoteEvent = BaseEvent<VotingEvents.EndPool>;
export type StartVoteEvent = BaseEvent<VotingEvents.StartPool>;
export type RegisterUserEvent = BaseEvent<VotingEvents.RegisterUser, RegisterUserEventPayload>;
export type UpdateUserEvent = BaseEvent<VotingEvents.UpdateUser, UpdateUserEventPayload>;
export type RemoveUserEvent = BaseEvent<VotingEvents.RemoveUser, RemoveUserEventPayload>;

export type Events =
  | VoteEvent
  | EndVoteEvent
  | StartVoteEvent
  | RegisterUserEvent
  | RemoveUserEvent
  | UpdateUserEvent;
