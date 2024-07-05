import { User } from './context';

type Id<T> = T extends infer U ? {[K in keyof U]: U[K]} : never;

type BaseEvent<N, T extends Record<string, any> = {}> = Id<{type: N; createdBy: string} & T>;

export enum VotingEvents {
  StartPool = 'event:pool:start',
  EndPool = 'event:pool:end',
  Vote = 'event:pool:vote',
  RegisterUser = 'event:user:register',
  UpdateUser = 'event:user:update',
  RemoveUser = 'event:user:remove',
}

export type VoteEvent = BaseEvent<VotingEvents.Vote, {vote: string}>;
export type EndVoteEvent = BaseEvent<VotingEvents.EndPool>;
export type StartVoteEvent = BaseEvent<VotingEvents.StartPool>;
export type RegisterUserEvent = BaseEvent<VotingEvents.RegisterUser, {user: User}>;
export type UpdateUserEvent = BaseEvent<
  VotingEvents.UpdateUser,
  {name: string; payload: Partial<User>}
>;
export type RemoveUserEvent = BaseEvent<VotingEvents.RemoveUser, {user: User}>;

export type Events =
  | VoteEvent
  | EndVoteEvent
  | StartVoteEvent
  | RegisterUserEvent
  | RemoveUserEvent
  | UpdateUserEvent;
