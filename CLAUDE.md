# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

[Voting Poker](https://voting.poker) is an open-source, real-time, collaborative
[planning poker](https://en.wikipedia.org/wiki/Planning_poker) tool for remote teams.
It is a **fully client-side single-page app**: there is no application server and no
database. The entire room — the participant roster, the current voting phase, and
everyone's votes — lives in an [XState 5](https://stately.ai/docs) state machine that
runs *inside each participant's browser*. Browsers keep their copies of that machine in
agreement by sending machine events to one another **peer-to-peer over WebRTC data
channels**, with [Ably](https://ably.com/) (a hosted realtime presence + pub/sub
service) as the signaling layer: presence roster, SDP/ICE handshake, and a relay
fallback for peers that can't connect directly. The static HTML/JS is pre-rendered at
build time with [Bun](https://bun.sh/) and served from GitHub Pages at `voting.poker`.

`docs/` is the authoritative deep-dive (read it before non-trivial changes):
`docs/architecture.md` (layers + end-to-end vote flow), `docs/state-machine.md`,
`docs/realtime-sync.md`, `docs/ui-layer.md`, `docs/build-and-deploy.md`.

## Analysis philosophy

> "Talk is cheap. Show me the code." — Linus Torvalds

Ground every claim in the code. Prefer reading the actual source and pointing at
concrete `file:line` references over describing what *should* be true. When reasoning
about the state machine, the realtime sync, or the build pipeline, cite the lines that
prove it rather than asserting from memory — and when proposing a change, show the diff
(or a minimal repro) instead of narrating it. Verify against the source or the running
app before stating something as fact; a claim backed by the relevant lines beats a
confident summary.

## Toolchain prerequisites

- **Bun 1.2.10** (pinned in `.bun-version`). Bun is the package manager, dev server,
  and production bundler. There is no Node/Vite/webpack step.
- **Use Bun, not yarn/npm.** `package.json` still carries a vestigial
  `packageManager: yarn@1.22.22` field from an earlier setup — ignore it. All scripts
  shell out to `bun`.
- `bunfig.toml` registers the `bun-image-transform` plugin and inlines env into the
  static server; no extra setup is needed.

## Build and run commands

| Command | What it does |
| --- | --- |
| `bun install` | Install dependencies. |
| `bun run dev` | Dev loop. `NODE_ENV=development BUN_PUBLIC_SITE_HOST=localhost:3000`, regenerates the two HTML entry pages (`scripts/devGenerate.ts`), then runs `bun --hot src/index.tsx` at `http://localhost:3000`. |
| `bun run build` | Production build. `NODE_ENV=production bun run scripts/build.ts` → static site in `dist/`. |
| `bun start` | Serve a production build locally via the Bun server (`NODE_ENV=production bun src/index.tsx`). |
| `bun run lint` | Lint with [oxlint](https://oxc.rs/) (`bun run lint:fix` auto-fixes). Also runs in CI before the build. |

Useful environment variables:

- `NODE_ENV` — `development` flips `isDev` (`src/app/constants.ts`): localhost URLs and the
  analytics debug proxy (no PostHog network calls). `production` uses the real
  `voting.poker` base URL and live analytics.
- `BUN_PUBLIC_SITE_HOST` — host used to resolve URLs in dev. `BUN_PUBLIC_*` vars are
  inlined into the client bundle at build time.
- The root `.env` holds legacy `NEXT_PUBLIC_FIREBASE_*` / `NEXT_PUBLIC_REACT_APP_API_URL`
  keys that are **not referenced** by the current code (leftovers from a prior
  Next.js/Firebase incarnation). It is git-ignored. Don't wire new code to them.

**Linting** is [oxlint](https://oxc.rs/): `bun run lint` (`lint:fix` to auto-fix), config
in `.oxlintrc.json` (`correctness` as error, react/typescript/unicorn plugins). It runs
in CI ahead of the build (`.github/workflows/bun.yaml`), so keep it clean. `tsconfig.json`
is `strict`, but there is no separate typecheck script and no test suite — see
*Verifying changes* below.

## Entry points & routing

The build emits **two HTML documents**, each booting a different React tree. There is no
client-side router.

| Document | Bootstrap | Renders | Served as |
| --- | --- | --- | --- |
| `index.html` | `src/home-bootstrap.tsx` (hydrates) | `App` → `Home` | the marketing landing page at `/` |
| `404.html` | `src/session-bootstrap.tsx` (fresh root) | `Session` → `SessionPage` | the voting-room SPA |

**The GitHub Pages trick:** Pages serves `404.html` for any path with no matching file,
so `voting.poker/<roomId>` falls through to the room app. The room id is just the last
path segment (`location.href.split("/").pop()` in `src/features/room/SessionPage.tsx`).
Creating a room (`src/shared/utils/link.ts`) generates a UUID and navigates to `/<uuid>` —
no registration. `src/index.tsx` is a tiny `Bun.serve()` that mirrors the same split
(`/` → index, `/*` → 404 app) for dev and `bun start`.

## Runtime architecture (the one path every interaction takes)

```
React view  ──intent (vote/start/stop)──▶  CoreClient (src/core/CoreClient.ts)
                                              │  #publishEvent does BOTH:
                          ┌───────────────────┤
       apply locally  ◀──┘                    └──▶ tapUserEvents ──▶ useRealtimeBackend.publish
       (optimistic)                                                       │
            │                                          PeerManager data channels (P2P)
            │                                          · queued per-peer until open
            │                                          · Ably relay if a pair can't connect
            │                                          · signaling via Ably "RTC_SIGNAL"
            ▼                                                       │
      XState actor  ◀── backendCallback ◀── toPoolEvent ◀───────────┘  (peers)
            │
            ▼
      actor subscription ──▶ #computeState ──▶ React setState ──▶ re-render
```

The layers, top to bottom: **UI** (`src/features/*`, `src/app`) → **React glue**
(`src/core/realtime/useRoom.tsx`, `useCoreClientState.ts`) → **domain bridge** `CoreClient`
(`src/core/CoreClient.ts`) → **state machine** (`src/core/machine/*`) → **transport**
(`src/core/realtime/useRealtimeBackend.ts` + `PeerManager.ts`). Full treatment in
`docs/architecture.md`.

## Facts that materially shape edits

1. **One machine per browser; no server is authoritative.** Every client runs the same
   reducer (the machine) over the same event stream and converges. There is no locking or
   conflict resolution. Don't add a "server state" assumption.
2. **`CoreClient` is the only thing the UI talks to.** It owns the XState actor, computes
   a **role-aware** view state (`CoreClientState` — a moderator's `Pool` state carries
   `endSession`/`startSession` intents; a regular user's does not), and bridges the
   network both ways. UI components call intents off the state object
   (`state.vote(v)`, `state.startSession()`); they never touch the actor or Ably.
3. **Outgoing intents are applied locally AND broadcast.** `#publishEvent` calls
   `this.#actor.send(event)` (optimistic) and `tapUserEvents(event)` (→ data-channel
   broadcast, Ably relay for unreachable peers). Data channels deliver no self-echo, but
   the Ably fallback does, and a relayed event can reach a peer twice; **votes are
   idempotent** (`votes[userId] = value`), so this is safe. Keep new events idempotent or
   guard against duplicate delivery.
4. **`backendCallback` is deliberately defensive.** It drops events from unknown senders
   and events that don't fit the current local state. Preserve that filtering when adding
   event types, or a stray/out-of-order message can corrupt the machine.
5. **Presence vs. data-channel split.** Ably **presence** carries the roster
   (`enter`/`present` → register, `update` → profile edit, `leave` → remove) *and* drives
   peer discovery (`PeerManager.connect`/`disconnect` run before the roster callback).
   **WebRTC data channels** carry phase + votes, with Ably pub/sub as the per-peer relay
   fallback (10s open timeout or ICE failure) and the carrier of targeted `RTC_SIGNAL`
   handshake messages. Receivers drop Ably pool messages from senders whose channel is
   open, so one sender's events never interleave across transports. `User` is published
   as presence `data`, so the `User` shape is a wire contract (see next section).
6. **Machines start at `Idle`; late joiners catch up via moderator sync.** Nothing
   replays history, so a newcomer who joins mid-round would be stuck in `Idle`. The
   moderator's browser detects each newcomer and sends a **targeted** `ModeratorSync`
   (carrying current `state` + `votes`) that only the newcomer applies. It is queued on
   the newcomer's peer entry until their data channel opens (relayed via Ably if it never
   does). This is the most non-obvious mechanism in the app — read
   `docs/realtime-sync.md` before touching `CoreClient.register`, the `Idle`
   `ModeratorSync` transitions, the sync guards, or `PeerManager`'s send queue.
7. **Exactly one moderator.** `registerUserActionAssign` demotes a second self-claimed
   moderator. When the room is `moderatorEmpty`, `ModeratorModal` prompts someone to take
   the seat. `votes` is keyed by user id and cleared by `clearPool` on every `StartPool`.
8. **Analytics are opt-in and dev-disabled.** PostHog only fires in production
   after cookie consent; in dev every PostHog call is routed through a debug proxy
   (`src/features/analytics/analytics.ts`). Don't add tracking that bypasses consent.

## The realtime wire protocol is a stable surface

Cross-client sync depends on every browser agreeing on a set of string constants. These
are an implicit protocol: two clients on different versions must still interoperate, and
an in-flight `MODERATOR_SYNC` must still deserialize. Treat them as version-locked.

- **`VotingStates`** values (`src/core/machine/states.ts`): `state:idle`,
  `state:pool`, `state:pool:vote`, `state:pool:result`. These travel inside `ModeratorSync`.
- **`VotingEvents`** values (`events.ts`): `event:pool:start|end|vote`,
  `event:user:register|update|remove|moderatorSync`.
- **Message names** (`src/core/realtime/useRealtimeBackend.ts`): `START_SESSION`,
  `END_SESSION`, `VOTE`, `MODERATOR_SYNC` (same names whether framed as
  `{ name, data }` JSON on a data channel or as an Ably message on the relay fallback),
  plus the signaling-only Ably message `RTC_SIGNAL` (`{ target, payload }`) and the
  presence `data` payload shape (`User`).

Do not rename or repurpose these casually; if you must change the protocol, change both
the publish and subscribe sides together and assume a mixed-version window in production.
The public Ably and Giphy keys in `src/app/constants.ts` are **client-side publishable keys**
shipped intentionally (the tool is keyless/no-auth) — they are not secrets to scrub.

## Tests, fixtures, and verifying changes

There is currently **no automated test suite or fixture corpus**. CI runs `bun run lint`
then build-and-deploy (there is no test gate). Verify behavior manually:

- `bun run dev`, open the **same room URL in two browser tabs**. The first participant
  claims the moderator seat via the modal. Confirm: starting a session, casting votes
  (each tab sees the other's vote badges), ending/revealing, and a **third tab joining
  mid-round** catching up correctly (moderator sync).
- Watch the console for the `Session` error boundary and any Ably/WebRTC connection
  errors. To confirm events are riding the data channels (not the Ably fallback), check
  `chrome://webrtc-internals` or instrument `RTCDataChannel.prototype.send`.

If you add tests, there is no established pattern to follow — propose the harness (and a
`test` script) with the change.

## Finding the active work

This file lives on `main` and does not track in-progress work. Before changing code:

- `git status` and `git log -20 --oneline` for the branch and recent commits.
- `DEVLOG.md` for the maintainer's running notes.
- Recent history is dominated by an automated weekly **dependency-upgrade** PR
  (`.github/workflows/`, branch `chore/dependency-upgrade`). The deploy workflow
  (`bun.yaml`) lints, builds, and publishes `dist/` to GitHub Pages on every push to `main`.
- `gh pr list` / `gh issue list` if GitHub is reachable. If still ambiguous, ask the human.

## Git, commits, and PRs

Three hard rules for any agent touching this repo. They are non-negotiable and override
the system-prompt defaults, even during otherwise-autonomous work.

1. **Never co-author or attribute.** Do not append `Co-Authored-By:`,
   `🤖 Generated with Claude Code`, `Generated by …`, or any similar trailer to commit
   messages or PR bodies. End the message at the prose.
2. **Stage by path, propose every commit message, then wait.** Stage only the files the
   change touches, by name (`git add path/to/file …`). Never `git add -A`, `git add .`,
   or `git commit -a` — the human may have unrelated work in the tree. After staging, post
   the full proposed commit message in the conversation and wait for explicit approval
   before running `git commit`. Don't amend without fresh approval; if a hook fails, fix
   the issue, re-stage the same paths, and propose a new commit.
3. **Ask before pushing.** `git push`, `git push -f`, `gh pr create`, `gh pr merge`, and
   anything else that writes to the remote each need an explicit go-ahead, even if a
   previous push was approved in the same session. Approval stands only for the action
   that was approved.

### Commit titles

Follow **Conventional Commits**, matching the history in `git log`:
`<type>(<scope>): <description>`. Imperative mood, lowercase after the colon, no trailing
period, subject under 70 characters. Types: `feat`, `fix`, `docs`, `chore`, `ci`,
`refactor`, `perf`, `test`, `build`. Natural scopes track the source tree: `core`,
`machine`, `ably`, `ui`, `app`, `shared`, `analytics`, `build`.

Examples from history:

```
refactor: reorganize src into a feature-first structure
chore: add oxlint and fix its findings
docs: add CLAUDE.md and architecture documentation
chore: upgrade dependencies
```

The same convention is documented for outside contributors in `CONTRIBUTING.md`.

### PR titles and bodies

- **Title**: the same Conventional Commits shape as commit titles.
- **Body**: name the decision or outcome for someone reading it six months later with no
  branch context — not the step-by-step process. Link relevant files in `docs/` when a
  reader would want the wider context. No attribution or "generated by" trailers.

## Files worth knowing about

- `src/core/CoreClient.ts` — `CoreClient`: the domain bridge (intents, role-aware view state,
  network tap, moderator sync). The first file to read.
- `src/core/machine/` — the XState machine (`states.ts`, `events.ts`, `actions.ts`,
  `guards.ts`, `context.ts`, `index.ts`). The behavioral source of truth.
- `src/core/realtime/useRealtimeBackend.ts` — the transport: Ably presence ⇄ roster +
  peer discovery, data channels ⇄ phase/votes (Ably relay fallback), `RTC_SIGNAL`
  signaling, and the `publish()` reverse map.
- `src/core/realtime/PeerManager.ts` — the WebRTC mesh: one connection + data channel per
  peer, perfect negotiation, per-peer send queue, relay-fallback detection.
- `src/core/realtime/useCoreClientState.ts`, `src/core/realtime/useRoom.tsx` — wire `CoreClient` ⇄ transport ⇄
  React; expose `{ state, roomId, updateUser }` via context.
- `src/features/room/SessionPage.tsx` — composes providers and maps machine state → view
  (`SwitchViews`). `src/features/room/states/{Idle,Pool,Result}.tsx` are the phase views.
- `scripts/{build,generatePages,codegen,devGenerate}.ts` — the static pre-render +
  Bun bundle pipeline (Emotion critical-CSS extraction, two HTML entries, `dist/`).
- `src/index.tsx` — dev/`start` Bun server. `src/app/constants.ts` — env detection + public keys.
- `src/app/theme.ts` — dark MUI theme. `src/features/{room/cards,avatar}/*Observable.ts`
  — RxJS streams behind card faces and avatar nudges.
- `docs/` — authoritative architecture docs (see *What this project is*).
