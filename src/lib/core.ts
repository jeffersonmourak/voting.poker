import type { Simplify } from "type-fest";
import {
  type Actor,
  createActor,
  type SnapshotFrom,
  type Subscription,
} from "xstate";
import { initializeMachine, type MachineType } from "./machines/voting";
import type { User } from "./machines/voting/context";
import { type Events, VotingEvents } from "./machines/voting/events";
import { VotingStates } from "./machines/voting/states";

type ModeratorUser = Simplify<{ moderator: true }>;
type NonModeratorUser = Simplify<{ moderator: false }>;

type IdleModeratorEvents = {
  startSession: () => void;
};

// biome-ignore lint/complexity/noBannedTypes: !!
type IdleUserEvents = {};

type PoolModeratorEvents = {
  vote: (vote: string) => void;
  endSession: () => void;
};

type PoolUserEvents = {
  vote: (vote: string) => void;
};

type SharedMachineStates = {
  roomId: string;
  currentUser: User;
  moderatorEmpty: boolean;
  users: User[];
  votes: Record<string, string>;
};

type IdleMachineStates = Simplify<
  {
    state: VotingStates.Idle | VotingStates.PoolResult;
  } & SharedMachineStates
>;

type PoolMachineStates = Simplify<
  {
    state: VotingStates.Pool | VotingStates.PoolVote;
  } & SharedMachineStates
>;

type IdleResultsModeratorState = Simplify<
  IdleMachineStates & ModeratorUser & IdleModeratorEvents
>;
type IdleResultsNonModeratorState = Simplify<
  IdleMachineStates & NonModeratorUser & IdleUserEvents
>;
type PoolModeratorState = Simplify<
  PoolMachineStates & ModeratorUser & PoolModeratorEvents
>;
type PoolNonModeratorState = Simplify<
  PoolMachineStates & NonModeratorUser & PoolUserEvents
>;

export type AnyIdleResultState =
  | IdleResultsModeratorState
  | IdleResultsNonModeratorState;
export type AnyPoolState = PoolModeratorState | PoolNonModeratorState;
export type AnyCoreState = AnyIdleResultState | AnyPoolState;

export type CoreClientState =
  | IdleResultsModeratorState
  | IdleResultsNonModeratorState
  | PoolModeratorState
  | PoolNonModeratorState;

export type { User };

type tapUserEventsFn = (events: Events) => void;

class CoreClient {
  #user: User;
  #machine: MachineType;
  #actor: Actor<MachineType>;

  tapUserEvents: tapUserEventsFn | null = null;

  constructor(roomId: string, user: User) {
    this.#user = user;
    this.#machine = initializeMachine({
      roomId,
      users: [],
      votes: {},
    });

    this.#actor = createActor(this.#machine);
    this.#actor.start();
  }

  subscribe(callback: (state: CoreClientState) => void): Subscription {
    return this.#actor.subscribe((snapshot) => {
      const state = this.#computeState(snapshot);
      callback(state);
    });
  }

  subscribeAs(
    user: User,
    callback: (state: CoreClientState) => void
  ): Subscription {
    const subscription = this.subscribe(callback);

    this.#user = user;
    this.register(user);

    return subscription;
  }

  register(user: User) {
    const { state, votes, users } = this.state;

    const userAlreadyExists = users.some((u) => u.id === user.id);

    if (
      !userAlreadyExists &&
      user.id !== this.#user.id &&
      this.#user.moderator
    ) {
      const eventData: Events = {
        type: VotingEvents.ModeratorSync,
        state,
        votes,
        target: user.id,
        createdBy: this.#user.id,
      };

      this.tapUserEvents?.(eventData);
    }

    this.#actor.send({
      type: VotingEvents.RegisterUser,
      user,
      createdBy: "system",
    });
  }

  update(user: User) {
    if (user.id === this.#user?.id) {
      this.#user = user;
    }

    this.#actor.send({
      type: VotingEvents.UpdateUser,
      id: user.id,
      payload: user,
      createdBy: "system",
    });
  }

  backendCallback = (event: Events) => {
    const { state, users } = this.state;
    const user = users.find((u) => u.id === event.createdBy);

    if (!user) {
      return;
    }

    if (event.type === VotingEvents.ModeratorSync) {
      this.#actor.send(event);
    }

    if (state === VotingStates.Idle || state === VotingStates.PoolResult) {
      switch (event.type) {
        case VotingEvents.StartPool:
          this.#actor.send({
            type: VotingEvents.StartPool,
            createdBy: user.id,
          });
          break;
      }
    }

    if (state === VotingStates.Pool || state === VotingStates.PoolVote) {
      switch (event.type) {
        case VotingEvents.EndPool:
          this.#actor.send(event);
          break;
        case VotingEvents.Vote:
          if (!event.vote) {
            break;
          }
          this.#actor.send(event);
          break;
      }
    }
  };

  remove(user: User) {
    this.#actor.send({
      type: VotingEvents.RemoveUser,
      user,
      createdBy: "system",
    });
  }

  get state(): CoreClientState {
    const machineStateSnapshot = this.#actor.getSnapshot();

    return this.#computeState(machineStateSnapshot);
  }

  #computeState(
    machineStateSnapshot: SnapshotFrom<MachineType>
  ): CoreClientState {
    const user = this.#user;
    const currentMachineState = machineStateSnapshot.value;
    const { votes, users, roomId } = machineStateSnapshot.context;
    const moderator = user?.moderator ?? false;

    const moderatorEmpty =
      users.length === 0 || users.every((u) => !u.moderator);

    const sharedState: SharedMachineStates = {
      currentUser: users.find((u) => u.id === user.id) ?? user,
      moderatorEmpty,
      votes,
      users,
      roomId,
    };

    switch (currentMachineState) {
      case VotingStates.Pool:
      case VotingStates.PoolVote: {
        return user?.moderator
          ? ({
              state: currentMachineState,
              ...sharedState,
              moderator,
              vote: this.#voteActionByCurrentUser,
              endSession: this.#endSessionAction,
            } as PoolModeratorState)
          : ({
              state: currentMachineState,
              ...sharedState,
              moderator,
              vote: this.#voteActionByCurrentUser,
            } as PoolNonModeratorState);
      }
      default: {
        return user?.moderator
          ? ({
              ...sharedState,
              moderator,
              state: currentMachineState,
              startSession: this.#startSessionAction,
            } as IdleResultsModeratorState)
          : ({
              ...sharedState,
              moderator,
              state: currentMachineState,
            } as IdleResultsNonModeratorState);
      }
    }
  }

  #voteActionByCurrentUser = (vote: string) =>
    this.#voteAction(vote, this.#user);

  #voteAction = (vote: string, user: User) => {
    if (user.id === this.#user.id) {
      this.#user.vote = vote;
    }

    this.#publishEvent({ type: VotingEvents.Vote, vote, createdBy: user.id });
  };

  #endSessionAction = () => {
    this.#publishEvent({
      type: VotingEvents.EndPool,
      createdBy: this.#user.id,
    });
  };

  #startSessionAction = () => {
    this.#user.vote = null;
    this.#publishEvent({
      type: VotingEvents.StartPool,
      createdBy: this.#user.id,
    });
  };

  #publishEvent(eventData: Events) {
    this.#actor.send(eventData);
    this.tapUserEvents?.(eventData);
  }
}

export { CoreClient };
