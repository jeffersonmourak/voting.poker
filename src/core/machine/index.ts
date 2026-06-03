import { assign, createMachine } from "xstate";
import {
  CLEAR_POOL_ACTION_KEY,
  clearPoolActionAssign,
  COMPUTE_VOTE_ACTION_KEY,
  computeVoteActionAssign,
  MODEATOR_SYNC_VOTES_ACTION_KEY,
  moderatorSyncVotesAction,
  REGISTER_USER_ACTION_KEY,
  registerUserActionAssign,
  REMOVE_USER_ACTION_KEY,
  removeUserActionAssign,
  UPDATE_USER_ACTION_KEY,
  updateUserActionAssign,
} from "./actions";
import type { VotingContext } from "./context";
import type { Events } from "./events";
import {
  GUARD_MODERATOR_IS_RESULTING_KEY,
  GUARD_MODERATOR_IS_STARTING_KEY,
  GUARD_USER_IS_MODERATOR_KEY,
  MatchModeratorSyncState,
  userIsModeratorGuard,
} from "./guards";
import {
  IdleState,
  PoolResultState,
  PoolState,
  PoolVoteState,
  VotingStates,
} from "./states";

export type MachineType = ReturnType<typeof initializeMachine>;

export const initializeMachine = (context: VotingContext) =>
  createMachine(
    {
      id: "Voting Poker",
      initial: {
        target: VotingStates.Idle,
      },
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
        [COMPUTE_VOTE_ACTION_KEY]: assign(computeVoteActionAssign),
        [REGISTER_USER_ACTION_KEY]: assign(registerUserActionAssign),
        [UPDATE_USER_ACTION_KEY]: assign(updateUserActionAssign),
        [REMOVE_USER_ACTION_KEY]: assign(removeUserActionAssign),
        [CLEAR_POOL_ACTION_KEY]: assign(clearPoolActionAssign),
        [MODEATOR_SYNC_VOTES_ACTION_KEY]: assign(moderatorSyncVotesAction),
      },
      actors: {},
      guards: {
        [GUARD_USER_IS_MODERATOR_KEY]: userIsModeratorGuard,
        [GUARD_MODERATOR_IS_STARTING_KEY]: MatchModeratorSyncState(
          ({ state }) =>
            state === VotingStates.Pool || state === VotingStates.PoolVote
        ),
        [GUARD_MODERATOR_IS_RESULTING_KEY]: MatchModeratorSyncState(
          ({ state }) => state === VotingStates.PoolResult
        ),
      },
      delays: {},
    }
  );
