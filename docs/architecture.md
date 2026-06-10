# Architecture Overview

This document describes the overall shape of the system, the layers it is built
from, and how data flows through them. Read this first; the other documents
zoom into individual layers.

## Guiding principles

1. **No backend.** There is no application server and no database. All room
   state is computed in the browser. Voting traffic flows peer-to-peer over
   WebRTC data channels; the only remote dependencies at runtime are Ably
   (presence, WebRTC signaling, and a relay fallback) and a few third-party
   media/analytics services.
2. **State machine as the source of truth.** Room behavior is expressed once, as
   an XState machine. The UI is a pure function of machine state; networking is
   just a transport for machine events.
3. **Every client is authoritative over its own copy.** There is no elected
   leader that owns the canonical state. Instead, all clients run the same
   reducer (the machine) over the same event stream and converge.
4. **Static, pre-rendered delivery.** The app ships as static HTML/JS built by
   Bun and hosted on GitHub Pages.

## The layers

From the network at the bottom up to pixels at the top:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  7. Cross-cutting: theme · constants (app/) · analytics (features/)      │
├──────────────────────────────────────────────────────────────────────────┤
│  6. UI layer            src/features/{landing,room,avatar} · src/app     │
│      React + MUI views, RxJS-driven card/nudge effects                   │
├──────────────────────────────────────────────────────────────────────────┤
│  5. React integration   src/core/realtime (useRoom, useCoreClientState)  │
│      Context provider + glue between React, CoreClient, and Ably         │
├──────────────────────────────────────────────────────────────────────────┤
│  4. Domain bridge       src/core/CoreClient.ts                           │
│      Translates UI intents ⇄ machine events; computes view state;        │
│      drives moderator sync; "taps" outgoing events to the network        │
├──────────────────────────────────────────────────────────────────────────┤
│  3. State machine       src/core/machine/*                               │
│      XState machine: states, events, context, actions, guards            │
├──────────────────────────────────────────────────────────────────────────┤
│  2. Realtime transport  src/core/realtime/useRealtimeBackend.ts          │
│      WebRTC data-channel mesh (voting events, via PeerManager.ts)        │
│      + Ably presence (roster) · signaling · relay fallback               │
├──────────────────────────────────────────────────────────────────────────┤
│  1. Delivery / routing  scripts/*, *-bootstrap.tsx, src/index.tsx        │
│      Bun SSG build, two HTML entry points, GitHub Pages routing          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1. Delivery & routing

The build produces **two HTML documents**, each with its own React entry point:

| Document | Bootstraps | Renders | Purpose |
|---|---|---|---|
| `index.html` | `src/home-bootstrap.tsx` | `App` → `Home` | The marketing landing page (`/`) |
| `404.html` | `src/session-bootstrap.tsx` | `Session` → `SessionPage` | The voting room SPA |

The clever part: on **GitHub Pages**, any path that doesn't match a real file is
served `404.html`. So visiting `https://voting.poker/<roomId>` serves the
`404.html` document, which boots the room app. The room id is simply the last
path segment (`location.href.split("/").pop()`, see
`src/features/room/SessionPage.tsx`). Creating a room (`src/shared/utils/link.ts`) just
generates a UUID and navigates to `/<uuid>` — no registration step.

`src/index.tsx` is a small Bun `serve()` used for **local dev and `bun start`**;
it mirrors the same routing (`/` → index, `/*` → not-found). Full details in
[`build-and-deploy.md`](./build-and-deploy.md).

### 2. Realtime transport — `useRealtimeBackend` + `PeerManager`

`src/core/realtime/useRealtimeBackend.ts` owns the single Ably connection and a
WebRTC mesh (`src/core/realtime/PeerManager.ts`). It joins an Ably channel named
after the room id and splits responsibilities across the two:

- **Ably presence** → the participant roster *and* peer discovery.
  `enter`/`present`/`update`/`leave` presence events map to
  `RegisterUser`/`UpdateUser`/`RemoveUser` machine actions, and each
  register-type event also dials a WebRTC connection to that peer.
- **WebRTC data channels** → voting events. Named messages
  (`START_SESSION`, `END_SESSION`, `VOTE`, `MODERATOR_SYNC`) travel directly
  between browsers, one reliable/ordered channel per peer pair.
- **Ably pub/sub** → the supporting cast: targeted `RTC_SIGNAL` messages carry
  SDP offers/answers and ICE candidates, and the old named messages remain as a
  per-peer relay fallback for pairs whose data channel never opens.

It also returns a `publish(event)` function that does the reverse: turn a machine
event into the right presence update, data-channel send, or fallback publish. A
`DefaultUser` (random UUID + a
[`sillyname`](https://www.npmjs.com/package/sillyname)) is created per browser
tab and used as the Ably `clientId` and WebRTC peer id. See
[`realtime-sync.md`](./realtime-sync.md).

### 3. State machine — `src/core/machine`

An XState 5 machine with four states (`Idle`, `Pool`, `PoolVote`, `PoolResult`)
and a context of `{ users, roomId, votes }`. Events drive transitions; actions
mutate context (record a vote, add/remove a user, clear the pool); guards gate
moderator-only transitions. This is the **entire behavioral contract** of a room.
Full reference in [`state-machine.md`](./state-machine.md).

### 4. Domain bridge — `CoreClient`

`src/core/CoreClient.ts` is the heart of the client. It:

- **Owns the actor.** Creates and starts the XState actor for the room.
- **Exposes intents.** `vote()`, `startSession()`, `endSession()` are surfaced
  on the computed state object for the UI to call.
- **Computes view state.** `#computeState()` flattens machine state + the current
  user's role into a single discriminated union (`CoreClientState`) that the UI
  can `switch` on. The shape changes by role: a moderator's `Pool` state carries
  `endSession`, a regular user's does not.
- **Bridges the network both ways.** Outgoing: `#publishEvent` sends an event to
  the **local** actor *and* calls `tapUserEvents` (wired to Ably `publish`).
  Incoming: `backendCallback`/`register`/`update`/`remove` feed
  network-originated events into the local actor.
- **Drives moderator sync.** When a new user registers and the local user is the
  moderator, it emits a `ModeratorSync` aimed at that newcomer so they can catch
  up to an in-progress session (see [`realtime-sync.md`](./realtime-sync.md)).

### 5. React integration — hooks

- `src/core/realtime/useCoreClientState.ts` constructs the `CoreClient`, wires the
  realtime backend's callbacks into it, subscribes React state to machine snapshots, and
  sets `client.tapUserEvents = publish`. This is the seam where the domain layer,
  the transport, and React meet.
- `src/core/realtime/useRoom.tsx` wraps the above in a React context (`RoomProvider` /
  `useRoom`) and exposes `{ state, roomId, updateUser }` to the component tree.

### 6. UI layer

`src/features/room/SessionPage.tsx` composes the providers and picks a view per state:

```
BasePage
└─ RoomProvider                     (state + intents via context)
   └─ AvatarProvider                (profile editor + nudges)
      └─ PageContent
         ├─ ModeratorModal          (shown when no moderator present)
         ├─ RoomDetails             (timer · moderator controls · roster · invite)
         └─ SwitchViews
            ├─ Idle   → states/Idle.tsx     ("waiting to start")
            ├─ Pool   → states/Pool.tsx     (the card grid)
            └─ Result → states/Result.tsx   (tallied results)
```

Cards and avatar nudges are driven by **RxJS observables** co-located with
their feature (`src/features/room/cards/`, `src/features/avatar/`). Details in
[`ui-layer.md`](./ui-layer.md).

### 7. Cross-cutting concerns

- **Theme** (`src/app/theme.ts`): a dark MUI theme with custom button variants and
  the Mont typeface.
- **Analytics** (`src/features/analytics/analytics.ts`, `AnalyticsProvider`): PostHog,
  gated behind a cookie-consent banner and disabled in development (calls are
  routed through a debug proxy instead).
- **Constants** (`src/app/constants.ts`): environment detection (`isDev`), base URL,
  and the public Ably / Giphy keys.

## End-to-end data flow: casting a vote

This is the canonical path; start/stop/register follow the same shape.

```
 ① User clicks a card in states/Pool.tsx
       │  onClick={() => vote(value)}
       ▼
 ② CoreClient.#voteAction  (src/core/CoreClient.ts)
       │  records vote on local user, then #publishEvent(Vote)
       ▼
 ③ #publishEvent does TWO things:
       ├─▶ this.#actor.send(Vote)        ← optimistic local update
       └─▶ this.tapUserEvents(Vote)      ← hand off to the network
                                  │
                                  ▼
 ④ useCoreClientState: tapUserEvents = publish
       │  publish(Vote)  (src/core/realtime/useRealtimeBackend.ts)
       ▼
 ⑤ PeerManager.broadcast({ name: "VOTE", data: { vote, createdBy, … } })
       │  one send per peer data channel
       │  (peers without an open channel: queued, or relayed via
       │   Ably channel.publish("VOTE", …) as the fallback)
       ▼
                                         (every other browser)
                                                  │
                                                  ▼
 ⑥ datachannel onmessage → toPoolEvent → poolEventCallback(Vote)
                                                  │
                                                  ▼
 ⑦ CoreClient.backendCallback(Vote)
       │  validates sender is a known user & state allows it
       │  this.#actor.send(Vote)
       ▼
 ⑧ Machine runs computeVote action → context.votes[userId] = vote
       │
       ▼
 ⑨ actor subscription fires → #computeState → setState (React)
       │
       ▼
 ⑩ states/Pool.tsx re-renders; the chosen card shows as selected,
    and the user's avatar badge updates in SessionVotesSummary
```

Two things worth noting:

- **Optimistic + idempotent.** The originating client applies the vote locally in
  step ③; peers apply it in step ⑦. Data channels deliver no self-echo, but the
  Ably fallback path does, and the originator re-applies it. Votes are idempotent
  (writing the same `votes[userId] = value` twice is harmless), so neither path
  causes drift.
- **Guarding at the edge.** `backendCallback` ignores events from unknown senders
  and events that don't make sense in the current state, so a stray message
  can't corrupt the machine.

## Where state actually lives

| State | Owner | Synced via |
|---|---|---|
| Participant roster (`users`) | each machine's `context.users` | Ably **presence** |
| Voting phase (`Idle`/`Pool`/…) | each machine's state value | **WebRTC data channels** (`START_/END_SESSION`; Ably fallback) + moderator sync |
| Votes (`votes`) | each machine's `context.votes` | **WebRTC data channels** (`VOTE`; Ably fallback) + moderator sync |
| Current user identity | `DefaultUser` in `useRealtimeBackend` | local; published into presence |
| Profile edits (name/emoji/avatar) | machine `context.users` | Ably **presence** `update` |
| Consent / analytics identity | cookies + PostHog | local + PostHog |

## Key invariants

- **Exactly one moderator.** `registerUserActionAssign` demotes any second user
  who claims `moderator: true` when a moderator already exists. When the room has
  no moderator (`moderatorEmpty`), `ModeratorModal` is shown so someone can claim
  the seat.
- **The machine starts at `Idle`.** A late joiner therefore begins in `Idle` even
  if a session is already running — the moderator-sync protocol exists precisely
  to fast-forward them. See [`realtime-sync.md`](./realtime-sync.md).
- **`votes` is keyed by user id** and cleared (`clearPoolActionAssign`) whenever a
  new pool starts.
