import { describe, expect, test } from "bun:test";
import { type AnyPoolState, CoreClient } from "./CoreClient";
import { type Events, VotingEvents } from "./machine/events";
import { VotingStates } from "./machine/states";
import { makeUser } from "./testFixtures";

const MOD = makeUser("mod", { moderator: true });
const ALICE = makeUser("alice");

function makeClient(self = MOD) {
  const client = new CoreClient("room", self);
  const tapped: Events[] = [];
  client.tapUserEvents = (event) => tapped.push(event);
  client.register(self);
  return { client, tapped };
}

function startPool(client: CoreClient) {
  const state = client.state;
  if (!("startSession" in state)) {
    throw new Error("expected a moderator Idle state");
  }
  state.startSession();
}

describe("CoreClient view state", () => {
  test("moderator in Idle gets startSession and no vote intent", () => {
    const { client } = makeClient();
    const state = client.state;

    expect(state.state).toBe(VotingStates.Idle);
    expect(state.moderator).toBe(true);
    expect("startSession" in state).toBe(true);
    expect("vote" in state).toBe(false);
  });

  test("moderator in Pool gets vote and endSession", () => {
    const { client } = makeClient();
    startPool(client);
    const state = client.state;

    expect(state.state).toBe(VotingStates.Pool);
    expect("vote" in state).toBe(true);
    expect("endSession" in state).toBe(true);
    expect("startSession" in state).toBe(false);
  });

  test("non-moderator in Pool gets vote but no session controls", () => {
    const { client } = makeClient(makeUser("alice"));
    client.register(MOD);
    client.backendCallback({
      type: VotingEvents.StartPool,
      createdBy: MOD.id,
    });

    const state = client.state;
    expect(state.state).toBe(VotingStates.Pool);
    expect("vote" in state).toBe(true);
    expect("endSession" in state).toBe(false);
    expect("startSession" in state).toBe(false);
  });

  test("moderatorEmpty reflects the roster", () => {
    const { client } = makeClient(makeUser("alice"));
    expect(client.state.moderatorEmpty).toBe(true);

    client.register(MOD);
    expect(client.state.moderatorEmpty).toBe(false);
  });
});

describe("CoreClient intents publish optimistically", () => {
  test("vote applies locally and is tapped to the network", () => {
    const { client, tapped } = makeClient();
    startPool(client);

    (client.state as AnyPoolState).vote("5");

    expect(client.state.votes).toEqual({ [MOD.id]: "5" });
    expect(tapped).toContainEqual({
      type: VotingEvents.Vote,
      vote: "5",
      createdBy: MOD.id,
    });
  });

  test("endSession reveals locally and is tapped", () => {
    const { client, tapped } = makeClient();
    startPool(client);

    const state = client.state;
    if (!("endSession" in state)) {
      throw new Error("expected a moderator Pool state");
    }
    state.endSession();

    expect(client.state.state).toBe(VotingStates.PoolResult);
    expect(tapped).toContainEqual({
      type: VotingEvents.EndPool,
      createdBy: MOD.id,
    });
  });
});

describe("CoreClient.register and moderator sync", () => {
  test("moderator emits a targeted ModeratorSync for a genuinely new user", () => {
    const { client, tapped } = makeClient();
    startPool(client);
    (client.state as AnyPoolState).vote("5");

    client.register(ALICE);

    const syncs = tapped.filter(
      (e) => e.type === VotingEvents.ModeratorSync
    );
    expect(syncs).toEqual([
      {
        type: VotingEvents.ModeratorSync,
        state: VotingStates.PoolVote,
        votes: { [MOD.id]: "5" },
        target: ALICE.id,
        createdBy: MOD.id,
      },
    ]);
  });

  test("registering the same user again emits no second sync", () => {
    const { client, tapped } = makeClient();
    client.register(ALICE);
    client.register(ALICE);

    expect(
      tapped.filter((e) => e.type === VotingEvents.ModeratorSync)
    ).toHaveLength(1);
  });

  test("a non-moderator never emits a sync", () => {
    const { client, tapped } = makeClient(makeUser("alice"));

    client.register(makeUser("bob"));

    expect(
      tapped.filter((e) => e.type === VotingEvents.ModeratorSync)
    ).toHaveLength(0);
  });

  test("registering self emits no sync", () => {
    const { tapped } = makeClient();

    expect(
      tapped.filter((e) => e.type === VotingEvents.ModeratorSync)
    ).toHaveLength(0);
  });
});

describe("CoreClient.backendCallback defensiveness", () => {
  test("drops events from unknown senders", () => {
    const { client } = makeClient();
    startPool(client);

    client.backendCallback({
      type: VotingEvents.Vote,
      createdBy: "ghost",
      vote: "13",
    });

    expect(client.state.votes).toEqual({});
  });

  test("drops a Vote while Idle", () => {
    const { client } = makeClient();
    client.register(ALICE);

    client.backendCallback({
      type: VotingEvents.Vote,
      createdBy: ALICE.id,
      vote: "13",
    });

    expect(client.state.state).toBe(VotingStates.Idle);
    expect(client.state.votes).toEqual({});
  });

  test("drops a StartPool while already in Pool", () => {
    const { client } = makeClient();
    startPool(client);
    (client.state as AnyPoolState).vote("5");

    client.backendCallback({
      type: VotingEvents.StartPool,
      createdBy: MOD.id,
    });

    // A second StartPool would clear the votes; it must be filtered out.
    expect(client.state.votes).toEqual({ [MOD.id]: "5" });
  });

  test("applies a peer's Vote while in Pool", () => {
    const { client } = makeClient();
    client.register(ALICE);
    startPool(client);

    client.backendCallback({
      type: VotingEvents.Vote,
      createdBy: ALICE.id,
      vote: "8",
    });

    expect(client.state.state).toBe(VotingStates.PoolVote);
    expect(client.state.votes).toEqual({ [ALICE.id]: "8" });
  });

  test("applies a ModeratorSync from a known sender while Idle", () => {
    const { client } = makeClient(makeUser("alice"));
    client.register(MOD);

    client.backendCallback({
      type: VotingEvents.ModeratorSync,
      createdBy: MOD.id,
      target: "alice",
      state: VotingStates.PoolResult,
      votes: { [MOD.id]: "3" },
    });

    expect(client.state.state).toBe(VotingStates.PoolResult);
    expect(client.state.votes).toEqual({ [MOD.id]: "3" });
  });
});
