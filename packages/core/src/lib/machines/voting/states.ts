import {
  EventObject,
  ParameterizedObject,
  ProvidedActor,
  StateNodeConfig,
} from 'xstate';
import { CLEAR_POOL_ACTION_KEY, COMPUTE_VOTE_ACTION_KEY } from './actions';
import { VotingContext } from './context';
import { Events, VotingEvents } from './events';
import {
  GUARD_MODERATOR_IS_RESULTING_KEY,
  GUARD_MODERATOR_IS_STARTING_KEY,
  GUARD_USER_IS_MODERATOR_KEY,
} from './guards';
import { makeUserTransitions } from './helpers/transitions';

type State = StateNodeConfig<
  VotingContext,
  Events,
  ProvidedActor,
  ParameterizedObject,
  ParameterizedObject,
  string,
  string,
  never,
  EventObject,
  {}
>;

export enum VotingStates {
  Idle = 'state:idle',
  Pool = 'state:pool',
  PoolVote = 'state:pool:vote',
  PoolResult = 'state:pool:result',
}

export const IdleState = {
  on: {
    [VotingEvents.StartPool]: {
      target: VotingStates.Pool,
      guard: GUARD_USER_IS_MODERATOR_KEY,
      actions: {
        type: CLEAR_POOL_ACTION_KEY,
      },
    },
    [VotingEvents.ModeratorSync]: [
      {
        target: VotingStates.Pool,
        guard: { type: GUARD_MODERATOR_IS_STARTING_KEY },
      },
      {
        target: VotingStates.PoolResult,
        guard: { type: GUARD_MODERATOR_IS_RESULTING_KEY },
      },
      {
        target: VotingStates.Idle,
      },
    ],
    ...makeUserTransitions(VotingStates.Idle),
  },
};

export const PoolState = {
  on: {
    [VotingEvents.Vote]: {
      target: VotingStates.PoolVote,
      actions: {
        type: COMPUTE_VOTE_ACTION_KEY,
      },
    },
    [VotingEvents.EndPool]: {
      target: VotingStates.PoolResult,
      guard: GUARD_USER_IS_MODERATOR_KEY,
    },
    ...makeUserTransitions(VotingStates.Pool),
  },
};

export const PoolVoteState = {
  on: {
    [VotingEvents.EndPool]: {
      target: VotingStates.PoolResult,
      guard: GUARD_USER_IS_MODERATOR_KEY,
    },
    [VotingEvents.Vote]: {
      target: VotingStates.PoolVote,
      actions: {
        type: COMPUTE_VOTE_ACTION_KEY,
      },
    },
    ...makeUserTransitions(VotingStates.PoolVote),
  },
};

export const PoolResultState = {
  on: {
    [VotingEvents.StartPool]: {
      target: VotingStates.Pool,
      guard: GUARD_USER_IS_MODERATOR_KEY,
      actions: {
        type: CLEAR_POOL_ACTION_KEY,
      },
    },
    ...makeUserTransitions(VotingStates.PoolResult),
  },
};

export const states = {
  [VotingStates.Idle]: IdleState,
  [VotingStates.Pool]: PoolState,
  [VotingStates.PoolVote]: PoolVoteState,
  [VotingStates.PoolResult]: PoolResultState,
};

export type States = typeof states;
