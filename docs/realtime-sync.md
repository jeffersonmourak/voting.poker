# Realtime Synchronization

> Sources: `src/core/realtime/useRealtimeBackend.ts`,
> `src/core/realtime/PeerManager.ts`, `src/core/CoreClient.ts`,
> `src/core/realtime/useCoreClientState.ts`, `src/core/realtime/useRoom.tsx`

Voting Poker has no server to hold the canonical room state. Instead, each
browser runs its own copy of the [voting state machine](./state-machine.md), and
they stay consistent by sending machine events to one another **peer-to-peer**
over WebRTC data channels. [Ably](https://ably.com/) remains in the picture as
the *signaling layer*: it carries the presence roster (which doubles as peer
discovery), the SDP/ICE handshake that bootstraps each WebRTC connection, and a
relay fallback for peer pairs whose data channel cannot be established. This
document explains the transport, the `CoreClient` bridge that sits between
React and the machine, and the late-joiner "moderator sync" protocol that lets
someone catch up to a session already in progress.

## The collaborating pieces

```
   React component tree
        │  reads state, calls intents
        ▼
 ┌──────────────────┐   tapUserEvents (out)   ┌─────────────────────────┐
 │   CoreClient     │ ─────────────────────▶  │  useRealtimeBackend     │
 │ (src/core/       │                         │   .publish()            │
 │  CoreClient.ts)  │ ◀─────────────────────  │                         │
 │                  │   backendCallback (in)  │  PeerManager (WebRTC    │
 │  wraps XState    │   register/update/      │  data-channel mesh)     │
 │  actor           │   remove                │  + Ably channel         │
 └──────────────────┘                         │  (presence · signaling  │
        │                                     │   · relay fallback)     │
        │ wired together by useCoreClientState└─────────────────────────┘
        └──────────────────────────────────────────┘      │          │
                                                          │          │
                                              other peers' browsers  │
                                              (RTCDataChannel, P2P)  │
                                                                     ▼
                                                          Ably cloud (signaling,
                                                          channel = roomId)
```

- **`useRealtimeBackend`** — the transport. Owns the Ably connection and the
  `PeerManager`, translates presence/data-channel/relay messages ⇄ machine
  events, and routes outgoing events to the right wire.
- **`PeerManager`** — the WebRTC mesh. One `RTCPeerConnection` + one
  reliable/ordered `RTCDataChannel` per peer, negotiated over Ably and degraded
  to an Ably relay when a pair cannot connect.
- **`CoreClient`** — the domain bridge. Owns the machine actor, exposes intents,
  computes view state, and decides what to broadcast.
- **`useCoreClientState`** — the glue hook. Constructs the `CoreClient`, connects
  its `tapUserEvents` to `publish`, and routes incoming network events back into
  the client.

## Identity & the channel

Each browser tab creates a single `DefaultUser` once, at module load
(`useRealtimeBackend.ts`):

```ts
const DefaultUser: User = {
  id: uuidV4(),          // also the Ably clientId and the WebRTC peer id
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

## Three transport mechanisms, three kinds of traffic

### 1. Ably presence → the roster (`context.users`) and peer discovery

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

Presence is also **peer discovery**: before the roster callback runs, a
register-type event calls `PeerManager.connect(id)` (and `leave` calls
`disconnect(id)`), so the WebRTC handshake starts the moment a peer is known —
and a `ModeratorSync` fired during registration finds a peer entry to queue on.

### 2. WebRTC data channels → phase & votes

Round and vote events travel peer-to-peer. `publish()` maps machine events to
named messages (`{ name, data }`, JSON over an `RTCDataChannel`), and the
channel's `onmessage` maps them back via the shared `toPoolEvent` decoder:

| Machine event | Message name | Wire |
|---|---|---|
| `StartPool` | `START_SESSION` | broadcast to every peer channel |
| `EndPool` | `END_SESSION` | broadcast to every peer channel |
| `Vote` | `VOTE` | broadcast to every peer channel |
| `ModeratorSync` | `MODERATOR_SYNC` | sent on the target peer's channel only |
| `RegisterUser` | `presence.update` | Ably presence |
| `UpdateUser` | `presence.update` | Ably presence |
| `RemoveUser` | `presence.leave` | Ably presence |

How the mesh forms (`PeerManager.ts`):

- **One connection per pair, dialed deterministically.** Within each pair, the
  **lower user id** creates the data channel (which kicks off negotiation) and
  is the *impolite* side of the
  [perfect-negotiation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
  pattern; the higher id answers and is *polite*. This gives exactly one clean
  offer per pair and survives renegotiation (e.g. ICE restarts).
- **SDP and ICE ride Ably.** `onSignal` publishes a targeted `RTC_SIGNAL`
  message (`{ target, payload }`); receivers ignore any `RTC_SIGNAL` not
  addressed to them. STUN servers (Google + Cloudflare) provide NAT traversal;
  there is no TURN server.
- **Sends queue until the channel opens.** Events addressed to a peer whose
  channel is still connecting are buffered per-peer and flushed on open. This
  is what lets the moderator emit a `ModeratorSync` at the instant a newcomer
  appears in presence, before any channel to them exists.

### 3. Ably pub/sub → signaling and relay fallback

Some peer pairs can never establish a direct connection (symmetric NATs, strict
firewalls — there is no TURN server to bridge them). If a peer's channel hasn't
opened after a 10s timeout, or the connection reaches the `failed` state, that
peer flips to **relay mode**: queued messages are flushed to Ably as the same
named messages (`START_SESSION`, `VOTE`, …), and subsequent sends publish to
Ably directly. Receivers accept Ably pool messages only from senders whose data
channel is *not* open, so the same sender's events can never interleave across
the two transports. If the channel later opens (e.g. an ICE restart succeeds),
the pair returns to P2P delivery automatically. A browser where
`RTCPeerConnection` cannot be constructed at all (WebRTC blocked by a privacy
browser or extension) creates relay-born peer entries, so it still participates
fully — everything just rides Ably, as it did before the P2P transport.

Transport health is reported through the consent-gated analytics wrapper
(`capture` in `src/features/analytics/analytics.ts`): `p2p_channel_opened`
(`time_to_open_ms`, `reconnect`, `candidate_type`, `peer_count`) and
`p2p_relay_fallback` (`reason: timeout | connection_failed | channel_closed |
webrtc_unavailable`, `time_since_connect_ms`, `undelivered_count`). These are
the numbers to watch when deciding whether a TURN server is worth adding.

For ad-hoc inspection, every room tab exposes `window.nerdPoking`
(`src/core/realtime/nerdPoking.ts`) — a read-only, getter-backed view of the
live room: `phase`, `roomSize`, `moderator`, `participants` (each annotated
with its transport: `local`, `p2p`, `relay`, `connecting`), `votes`, and
`connections` (per-peer channel/connection state and queue depth).

## CoreClient: the domain bridge

`CoreClient` (`src/core/CoreClient.ts`) wraps the XState actor and is the only thing the
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

`tapUserEvents` is set by `useCoreClientState` to the backend's `publish`
function. So a single user action updates the local machine immediately **and**
is sent to peers. (`updateUser` in `useRoom` follows the same dual pattern
explicitly: `publish(UpdateUser)` then `client.update(payload)`.)

### Receiving network events (`backendCallback`)

Messages arriving from the network — whether over a data channel or the Ably
fallback — are funneled into `backendCallback`, which is deliberately
defensive:

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

**The problem.** Every machine starts in `Idle`. Events are only delivered to
peers that are connected *at the time* — neither the data channels nor Ably
replay the `START_SESSION`/`VOTE` history to someone who joins later. So a
participant who opens the room while a round is already underway would be stuck
in `Idle` with no votes, out of sync with everyone else.

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
                }  ──▶ tapUserEvents ──▶ PeerManager.send(target, "MODERATOR_SYNC")
                                              │
                                              │  queued on the newcomer's peer
                                              │  entry, delivered when the data
                                              │  channel opens (or published to
                                              │  Ably if the peer fell back to
                                              │  relay mode)
                                              ▼
        ┌──────────── the newcomer receives MODERATOR_SYNC ───────────────┐
        │  toPoolEvent checks: data.target === DefaultUser.id ?           │
        │     · target  → forward ModeratorSync into the machine          │
        │     · others  → ignore (relevant on the shared Ably fallback)   │
        └─────────────────────────────────────────────────────────────────┘
                                              │
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
- **Targeting happens at two levels.** The sync is sent on the target peer's own
  data channel, and the event additionally carries a `target` id that
  `toPoolEvent` checks against `DefaultUser.id`. The second check is what keeps
  the Ably fallback safe: even when the sync is published on the shared channel,
  only the intended newcomer acts on it.
- **The votes are copied wholesale** via the `moderatorSyncVotesAction`, and the
  phase is selected by the `guard:moderator:start` / `guard:moderator:result`
  guards.

The result: a late joiner is fast-forwarded to exactly what the moderator sees —
mid-round (with current votes) or on the results screen.

## Consistency model & caveats

- **Convergence, not consensus.** There is no locking or conflict resolution.
  Each client applies the same events to the same reducer, so they converge.
  Votes are last-write-wins per user id and idempotent, so the originator's
  local apply plus a duplicate delivery (e.g. a relay copy) don't conflict.
- **Ordering is per-pair, not global.** A data channel is reliable and ordered,
  so one sender's events arrive in order; there is no ordering guarantee
  *across* senders (Ably never provided one either). `backendCallback`'s
  state filtering is what absorbs cross-sender races.
- **Connectivity is best-effort P2P.** Without a TURN server, a hostile NAT
  pair silently degrades to the Ably relay after the open timeout — same
  behavior as the pre-P2P app, just for that pair only.
- **Moderator is the sync authority.** Catch-up depends on a moderator being
  present. If the room is `moderatorEmpty`, `ModeratorModal` prompts someone to
  take the seat (and the "one moderator" invariant is enforced in
  `registerUserActionAssign`).
- **No persistence.** State lives only in the connected browsers and in
  in-flight delivery. If everyone leaves, the room is gone; reopening the same
  URL starts fresh at `Idle`.
- **Public Ably key.** The Ably key in `src/app/constants.ts` is a client-side
  publishable key — anyone with a room URL can join that channel. This is by
  design for a frictionless, no-auth tool.
