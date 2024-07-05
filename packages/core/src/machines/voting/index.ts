import { createMachine } from 'xstate';
import {
  CLEAR_POOL_ACTION_KEY,
  clearPoolAction,
  COMPUTE_VOTE_ACTION_KEY,
  computeVoteAction,
  REGISTER_USER_ACTION_KEY,
  registerUserAction,
  REMOVE_USER_ACTION_KEY,
  removeUserAction,
  UPDATE_USER_ACTION_KEY,
  updateUserAction,
} from './actions';
import { VotingContext } from './context';
import { Events } from './events';
import { GUARD_USER_IS_MODERATOR_KEY, userIsModeratorGuard } from './guards';
import { IdleState, PoolResultState, PoolState, PoolVoteState, VotingStates } from './states';

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
      actions: {
        [COMPUTE_VOTE_ACTION_KEY]: computeVoteAction,
        [REGISTER_USER_ACTION_KEY]: registerUserAction,
        [UPDATE_USER_ACTION_KEY]: updateUserAction,
        [REMOVE_USER_ACTION_KEY]: removeUserAction,
        [CLEAR_POOL_ACTION_KEY]: clearPoolAction,
      },
      actors: {},
      guards: {
        [GUARD_USER_IS_MODERATOR_KEY]: userIsModeratorGuard,
      },
      delays: {},
    }
  );
