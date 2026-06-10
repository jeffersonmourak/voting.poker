import { describe, expect, test } from "bun:test";
import { createActor } from "xstate";
import { makeUser } from "../testFixtures";
import type { VotingContext } from "./context";
import { VotingEvents } from "./events";
import { initializeMachine } from "./index";
import { VotingStates } from "./states";

const MOD = makeUser("mod", { moderator: true });
const ALICE = makeUser("alice");
const BOB = makeUser("bob");

function spawn(overrides: Partial<VotingContext> = {}) {
  const actor = createActor(
    initializeMachine({ roomId: "room", users: [], votes: {}, ...overrides })
  );
  actor.start();
  return actor;
}

function spawnInPool() {
  const actor = spawn({ users: [MOD, ALICE] });
  actor.send({ type: VotingEvents.StartPool, createdBy: MOD.id });
  return actor;
}

describe("voting machine", () => {
  test("starts in Idle with the provided context", () => {
    const actor = spawn({ users: [ALICE] });
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe(VotingStates.Idle);
    expect(snapshot.context.users).toEqual([ALICE]);
    expect(snapshot.context.votes).toEqual({});
  });

  describe("StartPool", () => {
    test("moderator starts a pool and the votes are cleared", () => {
      const actor = spawn({
        users: [MOD, ALICE],
        votes: { [ALICE.id]: "8" },
      });

      actor.send({ type: VotingEvents.StartPool, createdBy: MOD.id });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.Pool);
      expect(snapshot.context.votes).toEqual({});
    });

    test("non-moderator cannot start a pool", () => {
      const actor = spawn({ users: [MOD, ALICE] });

      actor.send({ type: VotingEvents.StartPool, createdBy: ALICE.id });

      expect(actor.getSnapshot().value).toBe(VotingStates.Idle);
    });

    test("unknown sender cannot start a pool", () => {
      const actor = spawn({ users: [MOD] });

      actor.send({ type: VotingEvents.StartPool, createdBy: "ghost" });

      expect(actor.getSnapshot().value).toBe(VotingStates.Idle);
    });

    test("restarting from PoolResult clears the previous round's votes", () => {
      const actor = spawnInPool();
      actor.send({
        type: VotingEvents.Vote,
        createdBy: ALICE.id,
        vote: "5",
      });
      actor.send({ type: VotingEvents.EndPool, createdBy: MOD.id });
      expect(actor.getSnapshot().value).toBe(VotingStates.PoolResult);

      actor.send({ type: VotingEvents.StartPool, createdBy: MOD.id });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.Pool);
      expect(snapshot.context.votes).toEqual({});
    });
  });

  describe("Vote", () => {
    test("records the vote keyed by sender and moves to PoolVote", () => {
      const actor = spawnInPool();

      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "5" });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.PoolVote);
      expect(snapshot.context.votes).toEqual({ [ALICE.id]: "5" });
    });

    test("re-voting overwrites the previous vote (idempotent wire contract)", () => {
      const actor = spawnInPool();

      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "5" });
      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "8" });
      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "8" });

      expect(actor.getSnapshot().context.votes).toEqual({ [ALICE.id]: "8" });
    });

    test("votes from multiple users accumulate", () => {
      const actor = spawnInPool();

      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "5" });
      actor.send({ type: VotingEvents.Vote, createdBy: MOD.id, vote: "3" });

      expect(actor.getSnapshot().context.votes).toEqual({
        [ALICE.id]: "5",
        [MOD.id]: "3",
      });
    });

    test("a vote in Idle is ignored", () => {
      const actor = spawn({ users: [MOD, ALICE] });

      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "5" });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.Idle);
      expect(snapshot.context.votes).toEqual({});
    });
  });

  describe("EndPool", () => {
    test("moderator reveals from Pool and PoolVote", () => {
      const actor = spawnInPool();
      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "5" });

      actor.send({ type: VotingEvents.EndPool, createdBy: MOD.id });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.PoolResult);
      expect(snapshot.context.votes).toEqual({ [ALICE.id]: "5" });
    });

    test("non-moderator cannot end the pool", () => {
      const actor = spawnInPool();

      actor.send({ type: VotingEvents.EndPool, createdBy: ALICE.id });

      expect(actor.getSnapshot().value).toBe(VotingStates.Pool);
    });
  });

  describe("roster events", () => {
    test("registers a new user in any state", () => {
      const actor = spawn();

      actor.send({
        type: VotingEvents.RegisterUser,
        user: { ...ALICE },
        createdBy: "system",
      });

      expect(actor.getSnapshot().context.users).toEqual([ALICE]);
    });

    test("registering an existing id does not duplicate", () => {
      const actor = spawn({ users: [ALICE] });

      actor.send({
        type: VotingEvents.RegisterUser,
        user: { ...ALICE, name: "imposter" },
        createdBy: "system",
      });

      expect(actor.getSnapshot().context.users).toHaveLength(1);
    });

    test("a second self-claimed moderator is demoted", () => {
      const actor = spawn({ users: [MOD] });

      actor.send({
        type: VotingEvents.RegisterUser,
        user: makeUser("usurper", { moderator: true }),
        createdBy: "system",
      });

      const { users } = actor.getSnapshot().context;
      expect(users.find((u) => u.id === "usurper")?.moderator).toBe(false);
      expect(users.filter((u) => u.moderator)).toHaveLength(1);
    });

    test("updates patch the matching user only", () => {
      const actor = spawn({ users: [ALICE, BOB] });

      actor.send({
        type: VotingEvents.UpdateUser,
        id: ALICE.id,
        payload: { name: "renamed", moderator: true },
        createdBy: "system",
      });

      const { users } = actor.getSnapshot().context;
      expect(users.find((u) => u.id === ALICE.id)?.name).toBe("renamed");
      expect(users.find((u) => u.id === ALICE.id)?.moderator).toBe(true);
      expect(users.find((u) => u.id === BOB.id)?.name).toBe(BOB.name);
    });

    test("remove filters the user out", () => {
      const actor = spawn({ users: [ALICE, BOB] });

      actor.send({
        type: VotingEvents.RemoveUser,
        user: ALICE,
        createdBy: "system",
      });

      expect(actor.getSnapshot().context.users).toEqual([BOB]);
    });
  });

  describe("ModeratorSync (late-joiner catch-up)", () => {
    const sync = (state: VotingStates, votes: Record<string, string>) =>
      ({
        type: VotingEvents.ModeratorSync,
        createdBy: MOD.id,
        target: ALICE.id,
        state,
        votes,
      }) as const;

    test("carried Pool fast-forwards Idle to Pool and copies votes", () => {
      const actor = spawn({ users: [MOD, ALICE] });

      actor.send(sync(VotingStates.Pool, { [MOD.id]: "3" }));

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.Pool);
      expect(snapshot.context.votes).toEqual({ [MOD.id]: "3" });
    });

    test("carried PoolVote also lands on Pool", () => {
      const actor = spawn({ users: [MOD, ALICE] });

      actor.send(sync(VotingStates.PoolVote, { [MOD.id]: "3" }));

      expect(actor.getSnapshot().value).toBe(VotingStates.Pool);
    });

    test("carried PoolResult fast-forwards to PoolResult with votes", () => {
      const actor = spawn({ users: [MOD, ALICE] });

      actor.send(sync(VotingStates.PoolResult, { [MOD.id]: "3" }));

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.PoolResult);
      expect(snapshot.context.votes).toEqual({ [MOD.id]: "3" });
    });

    test("carried Idle stays in Idle and does not copy votes", () => {
      const actor = spawn({ users: [MOD, ALICE] });

      actor.send(sync(VotingStates.Idle, { [MOD.id]: "3" }));

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.Idle);
      expect(snapshot.context.votes).toEqual({});
    });

    test("is ignored outside Idle (no transition defined)", () => {
      const actor = spawnInPool();
      actor.send({ type: VotingEvents.Vote, createdBy: ALICE.id, vote: "5" });

      actor.send(sync(VotingStates.PoolResult, {}));

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe(VotingStates.PoolVote);
      expect(snapshot.context.votes).toEqual({ [ALICE.id]: "5" });
    });
  });
});
