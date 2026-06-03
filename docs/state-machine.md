# The Voting State Machine

> Source: `src/lib/machines/voting/`

The voting machine is the **behavioral source of truth** for a room. Everything
else — the UI, the network — exists to render its state or to feed it events.
It is an [XState 5](https://stately.ai/docs) machine, created by
`initializeMachine(context)` in `src/lib/machines/voting/index.ts`.

Each browser runs its **own instance** of this machine (wrapped by `CoreClient`,
see [`realtime-sync.md`](./realtime-sync.md)). Synchronization is achieved by
feeding every instance the same stream of events.

## File layout

| File | Responsibility |
|---|---|
| `index.ts` | Assembles the machine: registers states, actions, guards, and the typed context. |
| `states.ts` | The four states and their `on: { event → transition }` tables. |
| `events.ts` | The `VotingEvents` enum, per-event payload types, and the `Events` union. |
| `context.ts` | `User`, `RoomId`, and `VotingContext` (the extended state). |
| `actions.ts` | `assign` reducers that mutate context (record vote, add/remove user, …). |
| `guards.ts` | Predicates that gate transitions (is-moderator, sync-target checks). |
| `helpers/transitions.ts` | `makeUserTransitions()` — the roster events shared by every state. |

## Context (extended state)

```ts
interface User {
  id: string;            // Ably clientId (a UUID)
  name: string;          // random sillyname by default
  emoji: string;         // shown on the avatar badge before reveal
  avatar: string;        // image/GIF URL
  moderator: boolean;    // at most one true per room
  vote: string | null;   // last value this user picked
}

interface VotingContext {
  users: User[];                    // the roster
  roomId: string;
  votes: Record<string, string>;    // userId → chosen card value
}
```

Note that `votes` is the authoritative tally; `User.vote` is a convenience copy
the originating client keeps on its own user object.

## States

`VotingStates` (`states.ts`):

| State value | Constant | Meaning |
|---|---|---|
| `state:idle` | `Idle` | Lobby. No active round. Moderator can start. |
| `state:pool` | `Pool` | Round in progress, **no votes cast yet**. |
| `state:pool:vote` | `PoolVote` | Round in progress, **at least one vote cast**. Cards hidden. |
| `state:pool:result` | `PoolResult` | Round ended; votes revealed and tallied. |

`Pool` and `PoolVote` are functionally the same "voting is open" phase — the
split exists so the UI/telemetry can distinguish "nobody has voted yet" from
"voting underway". The `CoreClient` treats them together (`AnyPoolState`).

### State diagram

```
                ┌──────────────────────────────────────────────┐
                │                                              │
   StartPool    ▼          Vote                  EndPool       │ StartPool
  (moderator)  ┌──────┐ ──────────▶ ┌──────────┐ ──────────▶  ┌───────────┐
 ┌───────────▶ │ Pool │             │ PoolVote │  (moderator) │ PoolResult│
 │             └──────┘ ◀────────── └──────────┘              └───────────┘
 │                │        Vote          │                          │
 │                │   EndPool (mod)      │  EndPool (moderator)     │
 │                └──────────────────────┴──────────────────────────┘
 │                                   │
┌──────┐                             ▼
│ Idle │ ◀───────────────────────────┘  (PoolResult ──StartPool(mod)──▶ Pool)
└──────┘
   ▲
   │  ModeratorSync (no in-progress session) keeps you in Idle;
   │  ModeratorSync (session running) jumps Idle ──▶ Pool / PoolVote / PoolResult
```

Transitions in words:

- **Idle → Pool**: `StartPool`, moderator only. Runs `clearPool` (empties votes).
- **Pool → PoolVote**: first `Vote`. Runs `computeVote`.
- **PoolVote → PoolVote**: subsequent `Vote`s. Runs `computeVote` each time.
- **Pool/PoolVote → PoolResult**: `EndPool`, moderator only. Votes revealed.
- **PoolResult → Pool**: `StartPool`, moderator only. Runs `clearPool`.
- **Idle → Pool/PoolVote/PoolResult**: `ModeratorSync` (late-join catch-up; see
  the guards below and [`realtime-sync.md`](./realtime-sync.md)).
- **Any state → same state**: `RegisterUser` / `UpdateUser` / `RemoveUser`
  (roster changes never change the phase).

## Events

`VotingEvents` (`events.ts`). Every event carries `createdBy: string` (the id of
the user who triggered it) in addition to its payload.

| Event value | Constant | Payload | Triggered by |
|---|---|---|---|
| `event:pool:start` | `StartPool` | — | Moderator pressing **Start** |
| `event:pool:end` | `EndPool` | — | Moderator pressing **Stop** |
| `event:pool:vote` | `Vote` | `{ vote: string }` | Any participant clicking a card |
| `event:user:register` | `RegisterUser` | `{ user: User }` | Presence `enter`/`present` |
| `event:user:update` | `UpdateUser` | `{ id, payload: Partial<User> }` | Presence `update` (profile edit) |
| `event:user:remove` | `RemoveUser` | `{ user: User }` | Presence `leave` |
| `event:user:moderatorSync` | `ModeratorSync` | `{ state, votes, target }` | A moderator catching up a newcomer |

The `createdBy` field is what the moderator guard uses to decide whether the
sender is allowed to perform a moderator-only transition.

## Actions

All actions are `assign` reducers (`actions.ts`) that return new context slices.

| Key | What it does |
|---|---|
| `action:compute:vote` | `votes[event.createdBy] = event.vote` — records one vote. |
| `action:user:register` | Appends the user **if new**; **demotes** a second self-claimed moderator to keep the "one moderator" invariant. |
| `action:user:update` | Merges `payload` into the matching user (name/emoji/avatar/moderator). |
| `action:user:remove` | Filters the user out of the roster. |
| `action:clear:pool` | Resets `votes` to `{}` — runs on every `StartPool`. |
| `action:moderator:votes-sync` | Overwrites `votes` wholesale from a `ModeratorSync` payload. |

### The "one moderator" rule, in code

```ts
// registerUserActionAssign
const moderatorId = oldUsers.find(u => u.moderator)?.id;
if (moderatorId && user.moderator && moderatorId !== user.id) {
  user.moderator = false;   // a moderator already exists → demote the newcomer
}
```

## Guards

`guards.ts` exposes three predicates:

| Key | Predicate |
|---|---|
| `guard:user:moderator` | The `createdBy` user exists in the roster **and** has `moderator: true`. Gates `StartPool` and `EndPool`. |
| `guard:moderator:start` | The event is a `ModeratorSync` whose carried `state` is `Pool` or `PoolVote`. Routes a late joiner into the active round. |
| `guard:moderator:result` | The event is a `ModeratorSync` whose carried `state` is `PoolResult`. Routes a late joiner into the results view. |

`MatchModeratorSyncState(filter)` is a small factory that builds the latter two
from a state predicate.

## How the `Idle` state handles `ModeratorSync`

This is the most subtle transition table in the machine (`states.ts`):

```ts
[VotingEvents.ModeratorSync]: [
  { target: Pool,       guard: GUARD_MODERATOR_IS_STARTING, actions: moderatorSyncVotes },
  { target: PoolResult, guard: GUARD_MODERATOR_IS_RESULTING, actions: moderatorSyncVotes },
  { target: Idle },     // fallback: a sync that says "still idle"
]
```

XState evaluates the array top-to-bottom and takes the first guard that passes.
So a newcomer who joins mid-round receives a `ModeratorSync` and is moved to the
right state with the moderator's votes copied in. If the room is genuinely idle,
the unguarded fallback keeps them in `Idle`. The mechanics of *who sends* the
sync and *how it reaches only the newcomer* are covered in
[`realtime-sync.md`](./realtime-sync.md).

## Shared roster transitions

Every state spreads in `makeUserTransitions(currentState)`
(`helpers/transitions.ts`), which adds self-targeting `RegisterUser`,
`UpdateUser`, and `RemoveUser` handlers. This is why roster changes (people
joining, leaving, or editing their profile) work in **any** phase without
disturbing the current phase.
