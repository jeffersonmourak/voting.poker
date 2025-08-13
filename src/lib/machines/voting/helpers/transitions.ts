import {
  REGISTER_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
} from "../actions";
import { VotingEvents } from "../events";
import type { VotingStates } from "../states";

export const makeUserTransitions = (target: VotingStates) => ({
  [VotingEvents.RegisterUser]: {
    target,
    actions: {
      type: REGISTER_USER_ACTION_KEY,
    },
  },
  [VotingEvents.UpdateUser]: {
    target,
    actions: {
      type: UPDATE_USER_ACTION_KEY,
    },
  },
  [VotingEvents.RemoveUser]: {
    target,
    actions: {
      type: REMOVE_USER_ACTION_KEY,
    },
  },
});
