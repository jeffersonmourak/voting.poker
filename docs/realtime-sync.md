# Realtime Synchronization

> Sources: `src/hooks/useAblyBackend.ts`, `src/lib/core.ts`,
> `src/hooks/useCoreClientState.ts`, `src/hooks/useRoom.tsx`

Voting Poker has no server to hold the canonical room state. Instead, each
browser runs its own copy of the [voting state machine](./state-machine.md), and
they stay consistent by relaying machine events to one another through
[Ably](https://ably.com/). This document explains the transport, the
`CoreClient` bridge that sits between React and the machine, and the
late-joiner "moderator sync" protocol that lets someone catch up to a session
already in progress.

## The three collaborating pieces

```
   React component tree
        │  reads state, calls intents
        ▼
 ┌──────────────────┐   tapUserEvents (out)     ┌──────────────────┐
 │   CoreClient     │ ───────────────────────▶  │  useAblyBackend  │
 │ (src/lib/core.ts)│                           │   .publish()     │
 │                  │ ◀───────────────────────  │                  │
 │  wraps XState    │   backendCallback (in)    │  Ably channel    │
 │  actor           │   register/update/remove  │  (presence +     │
 └──────────────────┘                           │   pub/sub)       │
        │                                       └──────────────────┘
        │ wired together by useCoreClientState            │
        └─────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                                                  Ably cloud relay
                                                  (channel = roomId)
```

- **`useAblyBackend`** — the transport. Owns the Ably connection, translates
  presence/messages ⇄ machine events.
- **`CoreClient`** — the domain bridge. Owns the machine actor, exposes intents,
  computes view state, and decides what to broadcast.
- **`useCoreClientState`** — the glue hook. Constructs the `CoreClient`, connects
  its `tapUserEvents` to `publish`, and routes incoming network events back into
  the client.

## Identity & the channel

Each browser tab creates a single `DefaultUser` once, at module load
(`useAblyBackend.ts`):

```ts
const DefaultUser: User = {
  id: uuidV4(),          // also used as the Ably clientId
  name: sillyname(),     // e.g. "PurpleBadger"
  avatar: "",
  emoji: "🙈",
  moderator: false,
  vote: null,
};
```

The Ably channel is named after the **room id** (the last path segment of the
URL). Everyone who opens `voting.poker/<roomId>` joins the same channel, with
modes `PUBLISH`, `SUBSCRIBE`, `PRESENCE`, and `PRESENCE_SUBSCRIBE`.

## Two transport mechanisms, two kinds of state

Ably gives us two primitives, and the app maps each to a different slice of
machine state:

### 1. Presence → the roster (`context.users`)

`channel.presence` tracks who is in the room. On `channel.presence.enter`, the
browser publishes its `DefaultUser` (minus the id, which Ably supplies as
`clientId`). Subscribed presence events are translated to roster actions:

| Ably presence action | → machine action |
|---|---|
| `enter`, `present` | `REGISTER_USER_ACTION_KEY` → `CoreClient.register()` |
| `update` | `UPDATE_USER_ACTION_KEY` → `CoreClient.update()` |
| `leave` | `REMOVE_USER_ACTION_KEY` → `CoreClient.remove()` |

`present` fires for everyone **already** in the room when you join, which is how
a newcomer learns the existing roster. Profile edits (changing name/emoji/avatar
in the avatar modal) go out as `presence.update`.

### 2. Pub/sub messages → phase & votes

Round and vote events are regular channel messages. `publish()` maps machine
events to named Ably messages, and `channel.subscribe` maps them back:

| Machine event | Ably message name | Direction |
|---|---|---|
| `StartPool` | `START_SESSION` | publish ⇄ subscribe |
| `EndPool` | `END_SESSION` | publish ⇄ subscribe |
| `Vote` | `VOTE` | publish ⇄ subscribe |
| `ModeratorSync` | `MODERATOR_SYNC` | publish ⇄ subscribe (targeted) |
| `RegisterUser` | `presence.update` | publish only |
| `UpdateUser` | `presence.update` | publish only |
| `RemoveUser` | `presence.leave` | publish only |

## CoreClient: the domain bridge

`CoreClient` (`src/lib/core.ts`) wraps the XState actor and is the only thing the
rest of the app talks to. Its responsibilities:

### Computing view state (`#computeState`)

The raw machine snapshot isn't ergonomic for the UI, so `CoreClient` flattens it
into a **role-aware discriminated union**, `CoreClientState`:

- It merges the machine state value with shared fields (`roomId`, `currentUser`,
  `users`, `votes`, `moderatorEmpty`).
- It attaches **intents** based on the current user's role and the phase:
  - `Idle`/`PoolResult` + moderator → `{ startSession }`
  - `Pool`/`PoolVote` + moderator → `{ vote, endSession }`
  - `Pool`/`PoolVote` + non-moderator → `{ vote }`
  - `Idle`/`PoolResult` + non-moderator → (no intents)

This is why components can simply call `state.startSession()` or `state.vote(v)`
without knowing anything about the machine or the network.

### Publishing intents (`#publishEvent`)

Every outgoing intent goes through one method:

```ts
#publishEvent(eventData: Events) {
  this.#actor.send(eventData);   // 1. apply locally (optimistic)
  this.tapUserEvents?.(eventData); // 2. broadcast to everyone else
}
```

`tapUserEvents` is set by `useCoreClientState` to the Ably `publish` function.
So a single user action updates the local machine immediately **and** is relayed
to peers. (`updateUser` in `useRoom` follows the same dual pattern explicitly:
`publish(UpdateUser)` then `client.update(payload)`.)

### Receiving network events (`backendCallback`)

Messages arriving from Ably are funneled into `backendCallback`, which is
deliberately defensive:

```ts
backendCallback = (event) => {
  const user = this.state.users.find(u => u.id === event.createdBy);
  if (!user) return;                       // ignore unknown senders

  if (event.type === ModeratorSync) this.#actor.send(event);

  if (state is Idle or PoolResult) {
    if (event is StartPool) send StartPool;
  }
  if (state is Pool or PoolVote) {
    if (event is EndPool) send it;
    if (event is Vote && event.vote) send it;
  }
};
```

It only forwards events that make sense for the **current** local state and that
come from a **known** participant. This keeps an out-of-order or malformed
message from corrupting the machine. (Roster events bypass this and go through
`register`/`update`/`remove` directly.)

## The moderator sync protocol (late joiners)

This is the most important non-obvious mechanism in the app.

**The problem.** Every machine starts in `Idle`. Pub/sub messages are only
delivered to clients that are connected *at the time* — Ably does not replay the
`START_SESSION`/`VOTE` history to someone who joins later. So a participant who
opens the room while a round is already underway would be stuck in `Idle` with no
votes, out of sync with everyone else.

**The solution.** The moderator's browser detects each newcomer and sends them a
private snapshot of the current state.

```
 New participant joins
        │  presence "enter"/"present"
        ▼
 Every existing client runs CoreClient.register(newUser)
        │
        ├─ adds newUser to the roster (RegisterUser)
        │
        └─ IF (this client is the moderator
                AND newUser is genuinely new
                AND newUser ≠ me):
                emit ModeratorSync {
                  state:  <current phase>,
                  votes:  <current votes>,
                  target: newUser.id,
                  createdBy: moderator.id,
                }  ──▶ tapUserEvents ──▶ Ably "MODERATOR_SYNC"
                                              │
                                              ▼
        ┌──────────── every client receives MODERATOR_SYNC ───────────────┐
        │  channel.subscribe checks: data.target === DefaultUser.id ?     │
        │     · target  → forward ModeratorSync into the machine          │
        │     · others  → ignore                                          │
        └─────────────────────────────────────────────────────────────────┘
                                              │ (only the newcomer)
                                              ▼
        Idle state's ModeratorSync transitions (see state-machine.md):
          carried state Pool/PoolVote → go to Pool   + copy votes
          carried state PoolResult    → go to PoolResult + copy votes
          otherwise                   → stay Idle
```

Key points:

- **Only the moderator emits the sync** (`register()` checks
  `this.#user.moderator`). This avoids every existing peer blasting the newcomer
  with redundant snapshots.
- **Targeting happens at two levels.** The event carries a `target` id, and the
  Ably subscribe handler only forwards a `MODERATOR_SYNC` whose
  `data.target === DefaultUser.id`. So although the message is published on the
  shared channel, only the intended newcomer acts on it.
- **The votes are copied wholesale** via the `moderatorSyncVotesAction`, and the
  phase is selected by the `guard:moderator:start` / `guard:moderator:result`
  guards.

The result: a late joiner is fast-forwarded to exactly what the moderator sees —
mid-round (with current votes) or on the results screen.

## Consistency model & caveats

- **Convergence, not consensus.** There is no locking or conflict resolution.
  Each client applies the same events to the same reducer, so they converge.
  Votes are last-write-wins per user id and idempotent, so the originator's local
  apply + the echoed message don't conflict.
- **Moderator is the sync authority.** Catch-up depends on a moderator being
  present. If the room is `moderatorEmpty`, `ModeratorModal` prompts someone to
  take the seat (and the "one moderator" invariant is enforced in
  `registerUserActionAssign`).
- **No persistence.** State lives only in the connected browsers and in Ably's
  in-flight delivery. If everyone leaves, the room is gone; reopening the same
  URL starts fresh at `Idle`.
- **Public Ably key.** The Ably key in `src/constants.ts` is a client-side
  publishable key — anyone with a room URL can join that channel. This is by
  design for a frictionless, no-auth tool.
