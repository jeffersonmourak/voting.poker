import { Simplify } from 'type-fest';
import { Actor, createActor, SnapshotFrom, Subscription } from 'xstate';
import { initializeMachine, MachineType } from './machines/voting';
import { User } from './machines/voting/context';
import { VotingEvents } from './machines/voting/events';
import { VotingStates } from './machines/voting/states';

type ModeratorUser = Simplify<{moderator: true}>;
type NonModeratorUser = Simplify<{moderator: false}>;

type IdleModeratorEvents = {
  startSession: () => void;
};

type IdleUserEvents = {};

type PoolModeratorEvents = {
  vote: (vote: string) => void;
  endSession: () => void;
};

type PoolUserEvents = {
  vote: (vote: string) => void;
};

type SharedMachineStates = {
  currentUser: User | null;
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

type IdleResultsModeratorState = Simplify<IdleMachineStates & ModeratorUser & IdleModeratorEvents>;
type IdleResultsNonModeratorState = Simplify<IdleMachineStates & NonModeratorUser & IdleUserEvents>;
type PoolModeratorState = Simplify<PoolMachineStates & ModeratorUser & PoolModeratorEvents>;
type PoolNonModeratorState = Simplify<PoolMachineStates & NonModeratorUser & PoolUserEvents>;

export type AnyIdleResultState = IdleResultsModeratorState | IdleResultsNonModeratorState;
export type AnyPoolState = PoolModeratorState | PoolNonModeratorState;

export type CoreClientState =
  | IdleResultsModeratorState
  | IdleResultsNonModeratorState
  | PoolModeratorState
  | PoolNonModeratorState;

export type { User };

class CoreClient {
  #user: User | null;
  #machine: MachineType;
  #actor: Actor<MachineType>;

  constructor(roomId: string) {
    this.#user = null;
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

  subscribeAs(user: User, callback: (state: CoreClientState) => void): Subscription {
    const subscription = this.subscribe((state) => {
      console.log('subscribed as state', state);
      return callback(state);
    });

    this.#user = user;
    this.register(user);

    return subscription;
  }

  register(user: User) {
    this.#actor.send({type: VotingEvents.RegisterUser, user, createdBy: 'system'});
  }

  update(user: User) {
    this.#actor.send({
      type: VotingEvents.UpdateUser,
      name: user.name,
      payload: user,
      createdBy: 'system',
    });
  }

  remove(user: User) {
    this.#actor.send({type: VotingEvents.RemoveUser, user, createdBy: 'system'});
  }

  get state(): CoreClientState {
    const machineStateSnapshot = this.#actor.getSnapshot();

    return this.#computeState(machineStateSnapshot);
  }

  #computeState(machineStateSnapshot: SnapshotFrom<MachineType>): CoreClientState {
    const user = this.#user;
    const currentMachineState = machineStateSnapshot.value;
    const votes = machineStateSnapshot.context.votes;
    const users = machineStateSnapshot.context.users;

    const sharedState = {
      moderator: user?.moderator ?? false,
      currentUser: user,
      votes,
      users,
    };

    switch (currentMachineState) {
      case VotingStates.Idle:
      case VotingStates.PoolResult: {
        return user?.moderator
          ? ({
              ...sharedState,
              state: currentMachineState,
              startSession: this.#startSessionAction,
            } as IdleResultsModeratorState)
          : ({
              ...sharedState,
              state: currentMachineState,
            } as IdleResultsNonModeratorState);
      }
      case VotingStates.Pool:
      case VotingStates.PoolVote: {
        return user?.moderator
          ? ({
              state: currentMachineState,
              ...sharedState,
              vote: this.#voteActionByCurrentUser,
              endSession: this.#endSessionAction,
            } as PoolModeratorState)
          : ({
              state: currentMachineState,
              ...sharedState,
              vote: this.#voteActionByCurrentUser,
            } as PoolNonModeratorState);
      }
    }
  }

  #voteActionByCurrentUser = (vote: string) => this.#voteAction(vote, this.#user);

  #voteAction = (vote: string, user: User) => {
    this.#actor.send({type: VotingEvents.Vote, vote, createdBy: user.name});
  };

  #endSessionAction = () => {
    this.#actor.send({type: VotingEvents.EndPool, createdBy: this.#user.name});
  };

  #startSessionAction = () => {
    this.#actor.send({type: VotingEvents.StartPool, createdBy: this.#user.name});
  };
}

export default CoreClient;

export { VotingStates };

