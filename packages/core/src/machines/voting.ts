import { ParameterizedObject, ProvidedActor, StateNodeConfig, createMachine } from 'xstate';

type Id<T> = T extends infer U ? {[K in keyof U]: U[K]} : never;

type BaseEvent<N, T extends Record<string, any> = {}> = Id<{type: N} & T>;

type VoteEvent = BaseEvent<VotingEvents.Vote, {vote: string}>;
type EndVoteEvent = BaseEvent<VotingEvents.EndPool>;
type StartVoteEvent = BaseEvent<VotingEvents.StartPool>;

type Events = VoteEvent | EndVoteEvent | StartVoteEvent;

type State = StateNodeConfig<
  VotingContext,
  Events,
  ProvidedActor,
  ParameterizedObject,
  ParameterizedObject,
  string,
  string,
  {}
>;

export interface User {
  name: string;
  emoji: string;
  avatar: string;
  moderator: boolean;
}

export type RoomId = string;

export interface VotingContext {
  user: User;
  roomId: RoomId;
}

export enum VotingStates {
  Idle = 'state:idle',
  Pool = 'state:pool',
  PoolVote = 'state:pool:vote',
  PoolResult = 'state:pool:result',
}

export enum VotingEvents {
  StartPool = 'event:pool:start',
  EndPool = 'event:pool:end',
  Vote = 'event:pool:vote',
}

const GUARD_USER_IS_MODERATOR_KEY = 'guard:user:moderator' as const;

const IdleState: State = {
  on: {
    [VotingEvents.StartPool]: {
      target: VotingStates.Pool,
      guard: GUARD_USER_IS_MODERATOR_KEY,
    },
  },
};

const PoolState: State = {
  on: {
    [VotingEvents.Vote]: {
      target: VotingStates.PoolVote,
    },
    [VotingEvents.EndPool]: {
      target: VotingStates.PoolResult,
      guard: GUARD_USER_IS_MODERATOR_KEY,
    },
  },
};

const PoolVoteState: State = {
  on: {
    [VotingEvents.EndPool]: {
      target: VotingStates.PoolResult,
      guard: GUARD_USER_IS_MODERATOR_KEY,
    },
    [VotingEvents.Vote]: {
      target: VotingStates.PoolVote,
    },
  },
};

const PoolResultState: State = {
  on: {
    [VotingEvents.StartPool]: {
      target: VotingStates.Pool,
      guard: GUARD_USER_IS_MODERATOR_KEY,
    },
  },
};

export type MachineType = ReturnType<typeof initializeMachine>;

export const initializeMachine = (context: VotingContext) =>
  createMachine(
    {
      id: 'Voting Poker',
      initial: VotingStates.Idle,
      states: {
        [VotingStates.Idle]: IdleState,
        [VotingStates.Pool]: PoolState,
        [VotingStates.PoolVote]: PoolVoteState,
        [VotingStates.PoolResult]: PoolResultState,
      },
      types: {
        events: {} as Events,
        context,
      },
      context,
    },
    {
      actions: {},
      actors: {},
      guards: {
        [GUARD_USER_IS_MODERATOR_KEY]: ({context}) => {
          return context.user.moderator;
        },
      },
      delays: {},
    }
  );
