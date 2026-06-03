# Voting Poker — Documentation

[Voting Poker](https://voting.poker) is an open-source, real-time, collaborative
[planning poker](https://en.wikipedia.org/wiki/Planning_poker) tool for remote
teams. Create a room, share the link, and vote on estimates together — no
sign-up, no backend server, no cost.

This folder documents **how the app is built and how it works internally**. It
is aimed at contributors and anyone trying to understand the codebase.

> For a user-facing description, privacy/telemetry notes, and the license, see
> the repository [`README.md`](../README.md).

## What it is, in one paragraph

Voting Poker is a **fully client-side single-page app**. There is no application
server and no database. The entire room — who is present, the current voting
phase, and everyone's votes — lives in an [XState](https://stately.ai/docs)
state machine that runs **inside each participant's browser**. Browsers keep
their copies of that machine in agreement by relaying events to one another over
[Ably](https://ably.com/) (a hosted realtime pub/sub + presence service). The
static HTML/JS is pre-rendered at build time with [Bun](https://bun.sh/) and
served from GitHub Pages.

## Mental model

```
        ┌─────────────────────────────────────────────────────────┐
        │                      Ably (hosted)                      │
        │     channel = roomId   ·   presence + pub/sub relay     │
        └─────────────────────────────────────────────────────────┘
              ▲                    ▲                    ▲
              │ events             │ events             │ events
        ┌─────┴─────┐        ┌─────┴─────┐        ┌─────┴─────┐
        │ Browser A │        │ Browser B │        │ Browser C │
        │ ┌───────┐ │        │ ┌───────┐ │        │ ┌───────┐ │
        │ │XState │ │        │ │XState │ │        │ │XState │ │
        │ │machine│ │        │ │machine│ │        │ │machine│ │
        │ └───────┘ │        │ └───────┘ │        │ └───────┘ │
        │   React   │        │   React   │        │   React   │
        └───────────┘        └───────────┘        └───────────┘
```

Every browser holds its **own** copy of the room's state machine. A local action
(vote, start, stop) is applied locally **and** broadcast through Ably; remote
browsers receive it and apply the same event to their own machine. Because every
machine processes the same events, they converge on the same state.

## Documentation map

| Document | What it covers |
|---|---|
| [`architecture.md`](./architecture.md) | The big picture: the layers, the modules in each layer, and the end-to-end data flow of a vote. **Start here.** |
| [`state-machine.md`](./state-machine.md) | The XState voting machine — states, events, context, actions, guards. The source of truth for room behavior. |
| [`realtime-sync.md`](./realtime-sync.md) | The Ably realtime layer, the `CoreClient` bridge, and the late-joiner "moderator sync" protocol. |
| [`ui-layer.md`](./ui-layer.md) | The React/MUI UI: component tree, providers, the RxJS observables behind cards & nudges, theming, and analytics. |
| [`build-and-deploy.md`](./build-and-deploy.md) | The Bun build pipeline, static pre-rendering, the GitHub Pages SPA routing trick, and CI/CD. |

## Tech stack at a glance

| Concern | Choice |
|---|---|
| Runtime & bundler | [Bun](https://bun.sh/) (`bun --hot` dev server, `Bun.build` for production) |
| UI | [React 19](https://react.dev/) + [MUI](https://mui.com/) + [Emotion](https://emotion.sh/) |
| State | [XState 5](https://stately.ai/docs) finite state machine |
| Realtime | [Ably](https://ably.com/) modular SDK (presence + pub/sub) |
| Reactive streams | [RxJS](https://rxjs.dev/) (card backgrounds, avatar nudges) |
| Media | [Giphy](https://developers.giphy.com/) (GIF card faces & avatars) |
| Analytics | [PostHog](https://posthog.com/) (consent-gated) |
| Hosting | GitHub Pages (static), custom domain `voting.poker` |

## Local development

```bash
bun install
bun run dev      # generates pages, then runs `bun --hot src/index.tsx`
```

The dev server runs at `http://localhost:3000`. See
[`build-and-deploy.md`](./build-and-deploy.md) for what `dev`, `build`, and
`start` each do.
