import { describe, expect, test } from "bun:test";
import { type AnyIdleResultState, type AnyPoolState, CoreClient } from "./CoreClient";
import { VotingEvents } from "./machine/events";
import type { User } from "./machine/context";
import { VotingStates } from "./machine/states";
import { makeUser } from "./testFixtures";

/**
 * An in-memory room: N CoreClients wired the way the real transport wires
 * them. Outgoing events (tapUserEvents) are delivered to every other client's
 * backendCallback — except ModeratorSync, which is delivered only to its
 * target, mirroring the transport-level filtering in useRealtimeBackend.
 * Roster changes mirror Ably presence: a joiner first registers everyone
 * already present (the `present` events), then everyone registers the joiner
 * (their `enter` event).
 */
class Room {
  clients = new Map<string, CoreClient>();
  users = new Map<string, User>();
  /** Deliver every pool event this many times (2 ≈ relay echo duplication). */
  deliveries = 1;

  join(user: User): CoreClient {
    const client = new CoreClient("room", user);

    client.tapUserEvents = (event) => {
      for (let round = 0; round < this.deliveries; round++) {
        for (const [id, peer] of this.clients) {
          if (id === user.id) {
            continue;
          }
          if (
            event.type === VotingEvents.ModeratorSync &&
            event.target !== id
          ) {
            continue;
          }
          peer.backendCallback(event);
        }
      }
    };

    for (const existing of this.users.values()) {
      client.register(existing);
    }

    client.register(user);
    this.clients.set(user.id, client);
    this.users.set(user.id, user);

    for (const [id, peer] of this.clients) {
      if (id !== user.id) {
        peer.register(user);
      }
    }

    return client;
  }

  snapshots() {
    return [...this.clients.values()].map((client) => ({
      state: client.state.state,
      votes: client.state.votes,
      userIds: client.state.users.map((u) => u.id).sort(),
    }));
  }

  expectConverged() {
    const [first, ...rest] = this.snapshots();
    for (const other of rest) {
      expect(other).toEqual(first);
    }
  }
}

const start = (client: CoreClient) =>
  (client.state as AnyIdleResultState & { startSession: () => void }).startSession();
const vote = (client: CoreClient, value: string) =>
  (client.state as AnyPoolState).vote(value);
const end = (client: CoreClient) =>
  (client.state as AnyPoolState & { endSession: () => void }).endSession();

describe("multi-client convergence", () => {
  test("a full round converges on every client", () => {
    const room = new Room();
    const mod = room.join(makeUser("mod", { moderator: true }));
    const alice = room.join(makeUser("alice"));

    start(mod);
    vote(mod, "5");
    vote(alice, "8");

    room.expectConverged();

    end(mod);

    room.expectConverged();
    expect(mod.state.state).toBe(VotingStates.PoolResult);
    expect(mod.state.votes).toEqual({ mod: "5", alice: "8" });
  });

  test("a mid-round late joiner is fast-forwarded by the moderator sync", () => {
    const room = new Room();
    const mod = room.join(makeUser("mod", { moderator: true }));
    const alice = room.join(makeUser("alice"));

    start(mod);
    vote(mod, "5");
    vote(alice, "8");

    const carol = room.join(makeUser("carol"));

    // A carried PoolVote lands on Pool (the two phases render identically);
    // the state values fully reconverge on the next event.
    expect(carol.state.state).toBe(VotingStates.Pool);
    expect(carol.state.votes).toEqual({ mod: "5", alice: "8" });

    // ...and the newcomer participates in the same round.
    vote(carol, "13");
    room.expectConverged();
  });

  test("a post-reveal late joiner lands on the results", () => {
    const room = new Room();
    const mod = room.join(makeUser("mod", { moderator: true }));
    room.join(makeUser("alice"));

    start(mod);
    vote(mod, "5");
    end(mod);

    const carol = room.join(makeUser("carol"));

    expect(carol.state.state).toBe(VotingStates.PoolResult);
    expect(carol.state.votes).toEqual({ mod: "5" });
    room.expectConverged();
  });

  test("a joiner before any round starts stays Idle", () => {
    const room = new Room();
    room.join(makeUser("mod", { moderator: true }));
    const alice = room.join(makeUser("alice"));

    expect(alice.state.state).toBe(VotingStates.Idle);
    room.expectConverged();
  });

  test("duplicate delivery (relay echo) does not corrupt the room", () => {
    const room = new Room();
    room.deliveries = 2;

    const mod = room.join(makeUser("mod", { moderator: true }));
    const alice = room.join(makeUser("alice"));

    start(mod);
    vote(mod, "5");
    vote(alice, "8");
    end(mod);

    room.expectConverged();
    expect(mod.state.state).toBe(VotingStates.PoolResult);
    expect(mod.state.votes).toEqual({ mod: "5", alice: "8" });
  });

  test("a second round starts clean everywhere", () => {
    const room = new Room();
    const mod = room.join(makeUser("mod", { moderator: true }));
    const alice = room.join(makeUser("alice"));

    start(mod);
    vote(alice, "8");
    end(mod);
    start(mod);

    room.expectConverged();
    expect(alice.state.state).toBe(VotingStates.Pool);
    expect(alice.state.votes).toEqual({});
  });
});
