import { Actor, createActor } from 'xstate';
import { MachineType, User, initializeMachine } from './machines/voting';

class CoreClient {
  #user: User;
  #machine: MachineType;
  #actor: Actor<MachineType>;

  constructor(user: User, roomId: string) {
    this.#machine = initializeMachine({
      roomId,
      user,
    });

    this.#user = user;
    this.#actor = createActor(this.#machine);

    this.#actor.subscribe((state) => {
      console.log(state);
    });

    this.#actor.start();
  }

  get state() {
    return this.#actor.getSnapshot().value
  }
}

export default CoreClient;
