# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

[Voting Poker](https://voting.poker) is an open-source, real-time, collaborative
[planning poker](https://en.wikipedia.org/wiki/Planning_poker) tool for remote teams.
It is a **fully client-side single-page app**: there is no application server and no
database. The entire room — the participant roster, the current voting phase, and
everyone's votes — lives in an [XState 5](https://stately.ai/docs) state machine that
runs *inside each participant's browser*. Browsers keep their copies of that machine in
agreement by relaying machine events to one another over [Ably](https://ably.com/) (a
hosted realtime presence + pub/sub service). The static HTML/JS is pre-rendered at build
time with [Bun](https://bun.sh/) and served from GitHub Pages at `voting.poker`.

`docs/` is the authoritative deep-dive (read it before non-trivial changes):
`docs/architecture.md` (layers + end-to-end vote flow), `docs/state-machine.md`,
`docs/realtime-sync.md`, `docs/ui-layer.md`, `docs/build-and-deploy.md`.

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

Useful environment variables:

- `NODE_ENV` — `development` flips `isDev` (`src/constants.ts`): localhost URLs and the
  analytics debug proxy (no PostHog/OpenReplay network calls). `production` uses the real
  `voting.poker` base URL and live analytics.
- `BUN_PUBLIC_SITE_HOST` — host used to resolve URLs in dev. `BUN_PUBLIC_*` vars are
  inlined into the client bundle at build time.
- The root `.env` holds legacy `NEXT_PUBLIC_FIREBASE_*` / `NEXT_PUBLIC_REACT_APP_API_URL`
  keys that are **not referenced** by the current code (leftovers from a prior
  Next.js/Firebase incarnation). It is git-ignored. Don't wire new code to them.

There is **no test, lint, or typecheck script** in `package.json`. The linter of record
is **Biome** (the codebase uses `// biome-ignore` directives), and `tsconfig.json` is
`strict`, but neither is wired into a script or CI. See *Verifying changes* below.

## Entry points & routing

The build emits **two HTML documents**, each booting a different React tree. There is no
client-side router.

| Document | Bootstrap | Renders | Served as |
| --- | --- | --- | --- |
| `index.html` | `src/home-bootstrap.tsx` (hydrates) | `App` → `Home` | the marketing landing page at `/` |
| `404.html` | `src/session-bootstrap.tsx` (fresh root) | `Session` → `SessionPage` | the voting-room SPA |

**The GitHub Pages trick:** Pages serves `404.html` for any path with no matching file,
so `voting.poker/<roomId>` falls through to the room app. The room id is just the last
path segment (`location.href.split("/").pop()` in `src/Session/SessionPage.tsx`).
Creating a room (`src/helpers/link.ts`) generates a UUID and navigates to `/<uuid>` —
no registration. `src/index.tsx` is a tiny `Bun.serve()` that mirrors the same split
(`/` → index, `/*` → 404 app) for dev and `bun start`.

## Runtime architecture (the one path every interaction takes)

```
React view  ──intent (vote/start/stop)──▶  CoreClient (src/lib/core.ts)
                                              │  #publishEvent does BOTH:
                          ┌───────────────────┤
       apply locally  ◀──┘                    └──▶ tapUserEvents ──▶ useAblyBackend.publish
       (optimistic)                                                       │
            │                                                Ably channel = roomId
            │                                                  (presence + pub/sub)
            ▼                                                       │
      XState actor  ◀── backendCallback ◀── channel.subscribe ◀─────┘  (echo + peers)
            │
            ▼
      actor subscription ──▶ #computeState ──▶ React setState ──▶ re-render
```

The layers, top to bottom: **UI** (`src/components`, `src/Session`) → **React glue**
(`src/hooks/useRoom.tsx`, `useCoreClientState.ts`) → **domain bridge** `CoreClient`
(`src/lib/core.ts`) → **state machine** (`src/lib/machines/voting/*`) → **transport**
(`src/hooks/useAblyBackend.ts`). Full treatment in `docs/architecture.md`.

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
   `this.#actor.send(event)` (optimistic) and `tapUserEvents(event)` (→ Ably publish).
   The originator also receives its own echoed message and re-applies it; **votes are
   idempotent** (`votes[userId] = value`), so this is safe. Keep new events idempotent or
   guard the echo.
4. **`backendCallback` is deliberately defensive.** It drops events from unknown senders
   and events that don't fit the current local state. Preserve that filtering when adding
   event types, or a stray/out-of-order message can corrupt the machine.
5. **Presence vs. pub/sub split.** Ably **presence** carries the roster (`enter`/`present`
   → register, `update` → profile edit, `leave` → remove). Ably **pub/sub messages**
   carry phase + votes. `User` is published as presence `data`, so the `User` shape is a
   wire contract (see next section).
6. **Machines start at `Idle`; late joiners catch up via moderator sync.** Ably does not
   replay history, so a newcomer who joins mid-round would be stuck in `Idle`. The
   moderator's browser detects each newcomer and sends a **targeted** `ModeratorSync`
   (carrying current `state` + `votes`) that only the newcomer applies. This is the most
   non-obvious mechanism in the app — read `docs/realtime-sync.md` before touching
   `CoreClient.register`, the `Idle` `ModeratorSync` transitions, or the sync guards.
7. **Exactly one moderator.** `registerUserActionAssign` demotes a second self-claimed
   moderator. When the room is `moderatorEmpty`, `ModeratorModal` prompts someone to take
   the seat. `votes` is keyed by user id and cleared by `clearPool` on every `StartPool`.
8. **Analytics are opt-in and dev-disabled.** PostHog/OpenReplay only fire in production
   after cookie consent; in dev every PostHog call is routed through a debug proxy
   (`src/helpers/analytics.ts`). Don't add tracking that bypasses consent.

## The realtime wire protocol is a stable surface

Cross-client sync depends on every browser agreeing on a set of string constants. These
are an implicit protocol: two clients on different versions must still interoperate, and
an in-flight `MODERATOR_SYNC` must still deserialize. Treat them as version-locked.

- **`VotingStates`** values (`src/lib/machines/voting/states.ts`): `state:idle`,
  `state:pool`, `state:pool:vote`, `state:pool:result`. These travel inside `ModeratorSync`.
- **`VotingEvents`** values (`events.ts`): `event:pool:start|end|vote`,
  `event:user:register|update|remove|moderatorSync`.
- **Ably message names** (`src/hooks/useAblyBackend.ts`): `START_SESSION`, `END_SESSION`,
  `VOTE`, `MODERATOR_SYNC`, and the presence `data` payload shape (`User`).

Do not rename or repurpose these casually; if you must change the protocol, change both
the publish and subscribe sides together and assume a mixed-version window in production.
The public Ably and Giphy keys in `src/constants.ts` are **client-side publishable keys**
shipped intentionally (the tool is keyless/no-auth) — they are not secrets to scrub.

## Tests, fixtures, and verifying changes

There is currently **no automated test suite, fixture corpus, or CI test gate** — the only
CI is build-and-deploy. Verify behavior manually:

- `bun run dev`, open the **same room URL in two browser tabs**. The first participant
  claims the moderator seat via the modal. Confirm: starting a session, casting votes
  (each tab sees the other's vote badges), ending/revealing, and a **third tab joining
  mid-round** catching up correctly (moderator sync).
- Watch the console for the `Session` error boundary and any Ably connection errors.

If you add tests, there is no established pattern to follow — propose the harness (and a
`test` script) with the change.

## Finding the active work

This file lives on `main` and does not track in-progress work. Before changing code:

- `git status` and `git log -20 --oneline` for the branch and recent commits.
- `DEVLOG.md` for the maintainer's running notes.
- Recent history is dominated by an automated weekly **dependency-upgrade** PR
  (`.github/workflows/`, branch `chore/dependency-upgrade`). The deploy workflow
  (`bun.yaml`) builds and publishes `dist/` to GitHub Pages on every push to `main`.
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
   before running `git commit`. Don't amend without fresh approval.
3. **Ask before pushing.** `git push`, `git push -f`, `gh pr create`, `gh pr merge`, and
   anything else that writes to the remote each need an explicit go-ahead, even if a
   previous push was approved in the same session.

### Commit and PR titles

Follow **Conventional Commits**, matching the `chore:`-style history in `git log`:
`<type>(<scope>): <description>`. Imperative mood, lowercase after the colon, no trailing
period, subject under 70 characters. Types: `feat`, `fix`, `docs`, `chore`, `ci`,
`refactor`, `perf`, `test`, `build`. Natural scopes track the source tree: `core`,
`machine`, `ably`, `hooks`, `ui`, `build`, `theme`, `analytics`.

> Note: `CONTRIBUTING.md` carries a generic `[TAG] Capitalized subject` commit template
> (an adopted third-party boilerplate). The actual repository history uses lowercase
> Conventional Commits — **follow the git-log convention**, not the boilerplate. The other
> CONTRIBUTING guidance (one change per PR, branch from `main`, spaces not tabs, explain
> *why* in the body) still applies.

Write PR bodies for someone reading six months later: name the outcome, not the process.
No attribution trailers in the body either.

## Files worth knowing about

- `src/lib/core.ts` — `CoreClient`: the domain bridge (intents, role-aware view state,
  network tap, moderator sync). The first file to read.
- `src/lib/machines/voting/` — the XState machine (`states.ts`, `events.ts`, `actions.ts`,
  `guards.ts`, `context.ts`, `index.ts`). The behavioral source of truth.
- `src/hooks/useAblyBackend.ts` — the only Ably integration: presence ⇄ roster, pub/sub
  ⇄ phase/votes, and the `publish()` reverse map.
- `src/hooks/useCoreClientState.ts`, `src/hooks/useRoom.tsx` — wire `CoreClient` ⇄ Ably ⇄
  React; expose `{ state, roomId, updateUser }` via context.
- `src/Session/SessionPage.tsx` — composes providers and maps machine state → view
  (`SwitchViews`). `src/components/States/{Idle,Pool,Result}.tsx` are the phase views.
- `scripts/{build,generatePages,codegen,devGenerate}.ts` — the static pre-render +
  Bun bundle pipeline (Emotion critical-CSS extraction, two HTML entries, `dist/`).
- `src/index.tsx` — dev/`start` Bun server. `src/constants.ts` — env detection + public keys.
- `src/theme.ts` — dark MUI theme. `src/observables/*` — RxJS streams behind card faces
  and avatar nudges.
- `docs/` — authoritative architecture docs (see *What this project is*).
