# UI Layer

> Sources: `src/features/{landing,room,avatar}/`, `src/app/`, `src/shared/`

The UI is built with **React 19** and **MUI** (Material UI) styled with
**Emotion**. It is a pure projection of the room state computed by the
[`CoreClient`](./realtime-sync.md): components read `useRoom().state` and call the
intents attached to it. A couple of visual effects (card faces, avatar nudges)
are driven by **RxJS** observables rather than React state.

## Two entry points, two trees

There are two distinct React trees, selected by which HTML document loaded (see
[`build-and-deploy.md`](./build-and-deploy.md)):

- **Landing page** — `App` → `Home` (`src/features/landing/Home.tsx`): the
  marketing page with the nav bar, landing graphic, "Get a room" / "Create a
  room" buttons (both call `toNewRoom`, which navigates to a fresh UUID URL), and
  the open-source manifesto section.
- **Room app** — `Session` → `SessionPage` (`src/features/room/`): the actual voting
  tool, described below.

`Session.tsx` wraps the room in an **error boundary** and lazy-loads
`SessionPage` only in the browser (`canUseDOM` guard), so the static
pre-render doesn't try to instantiate the realtime client.

## Room component tree

```
BasePage (layout.tsx → ThemeProvider + AnalyticsProvider + CssBaseline, footer)
└─ RoomProvider                       useRoom(): { state, roomId, updateUser }
   └─ AvatarProvider                  profile editor modal + AvatarContext
      └─ PageContent
         ├─ <Modal open={moderatorEmpty}> ModeratorModal   claim the moderator seat
         ├─ RoomDetails               sticky header
         │   ├─ Timer                 session stopwatch
         │   ├─ ModeratorControls     Start / Stop / Release (moderator only)
         │   ├─ SessionVotesSummary   avatar row with vote/emoji badges
         │   └─ InviteUrl             copyable room link
         └─ SwitchViews(state)        ← the per-phase body
             ├─ Idle        → states/Idle.tsx
             ├─ Pool|PoolVote → states/Pool.tsx
             └─ PoolResult  → states/Result.tsx
```

`SwitchViews` (`SessionPage.tsx`) is the single place that maps a machine state
to a view component.

## The three phase views

| State | Component | What the user sees |
|---|---|---|
| `Idle` | `states/Idle.tsx` | A "Let's get started!" hero with role-specific copy ("the moderator will start" vs. "give the signal"). |
| `Pool` / `PoolVote` | `states/Pool.tsx` | The grid of estimate cards. Clicking one calls `state.vote(value)`; the picked card shows selected. |
| `PoolResult` | `states/Result.tsx` | Votes grouped by value, sorted by share, with a big "winner" and a list of runners-up. |

### Card values

The deck is a fixed Fibonacci-ish set (`states/Pool.tsx`):

```
0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕️
```

`?` means "no idea" and `☕️` means "break".

### Results tallying

`states/Result.tsx` reads `state.votes`, groups by value with lodash `groupBy`,
and for each distinct value computes count, percentage of total, and a color.
Numeric values get a color from the [value color scale](#card-backgrounds-rxjs);
`?` and `☕️` get theme info/warning colors. The highest-share value is rendered
large (`ResultValueBig`), the rest as a list (`ResultValue`).

## Providers & context

- **`RoomProvider` / `useRoom`** (`src/core/realtime/useRoom.tsx`): exposes
  `{ state, roomId, updateUser }`. `state` is the role-aware `CoreClientState`;
  `updateUser` publishes a profile change to the network and applies it locally.
  Calling `useRoom()` outside the provider throws.
- **`AvatarProvider` / `AvatarContext`** (`src/features/avatar/AvatarProvider.tsx`):
  controls the avatar-editor modal (`open` flag) and renders
  `AvatarEditorModal` for the current user. On change it calls
  `identify()` (analytics) and `updateUser()`. The modal opens by default so a
  newcomer sets their profile first.
- **`AnalyticsProvider` / `AnalyticsContext`** (`src/features/analytics/AnalyticsProvider.tsx`):
  see [Analytics & consent](#analytics--consent).

## Avatars & profiles

A participant's identity is `{ name, emoji, avatar, moderator }`. The avatar
editor (`AvatarEditorModal`, with `FileUploader` and `GiphySearch`) lets users
upload an image or pick a GIF. `shared/utils/avatarProps.ts` turns a name/avatar into
MUI `<Avatar>` props (falling back to initials with a deterministic color from
`shared/utils/stringToColor.ts`). Profile changes propagate as Ably presence
`update`s.

`SessionVotesSummary` lays the roster out as a centered avatar row with the
current user in the middle (the "(You)" tag), splitting the rest into two halves.
Each `UserVote` shows two badges: a 👑 for the moderator and a vote badge that
displays the user's emoji while voting and flips to the actual value on reveal.

## Card backgrounds (RxJS)

> Source: `src/features/room/cards/cardBackgroundObservable.ts`, `src/features/room/cards/`

Each `Card` subscribes to `cardBackgroundObservable(value)`:

- **Numeric value** → `displayPercentage`: maps the number through
  `valueToColor` (`shared/utils/valueColorScale.ts`, a `log10`-based scale) to a fill
  **color and height**. Bigger estimates → taller, hotter-colored fills.
- **Non-numeric value** (`?`, `☕️`, or any text) → `displayGif`: queries Giphy
  (`?` → "idk", `☕️` → "coffee break") and uses the first result's image as the
  card face.

The card reveals its background on hover or when selected (`Card.tsx` toggles the
fill height), giving the deck its animated feel.

## Avatar nudges (RxJS)

> Source: `src/features/avatar/avatarMessagesObservable.ts`

A timed RxJS pipeline (`interval` + `switchScan`) periodically surfaces playful
"update your avatar with a GIF" messages, cycling through a fixed list with
display/hide timing and stopping once the list is exhausted. It's a pure
presentation stream, independent of room state.

## Theme & typography

> Source: `src/app/theme.ts`, `src/globals.css`, `src/assets/fonts/`

A dark MUI theme: black background, white primary text, a `#292929` paper
surface, and an 8px spacing grid (`getSize`). Custom `containedPrimary` /
`containedSecondary` button variants compute readable text colors from
background luminance, and inputs/labels get custom focus/shrink animations. The
display typeface is **Mont** (with **Monument Grotesk Mono**), loaded via
`globals.css`. Backdrops use a blurred translucent overlay.

The same `theme` is applied at build time during static rendering
(`scripts/codegen.tsx`) so the server markup matches the client.

## Analytics & consent

> Source: `src/features/analytics/AnalyticsProvider.tsx`,
> `src/features/analytics/DataCollectionNotification.tsx`, `src/features/analytics/analytics.ts`

Analytics are **opt-in and disabled in development**:

- In dev (`isDev`), every PostHog call is intercepted by a `Proxy` and routed to
  `debugAnalytics` instead of hitting the network (`features/analytics/analytics.ts`).
- In production, a `DataCollectionNotification` banner asks for consent. Consent
  status (`pending` / `accepted` / `rejected`) is stored in a cookie; a legacy
  boolean cookie format is migrated on read.
- Only when **accepted** does `AnalyticsProvider` enable tracking. `identify()`
  then attaches user properties (name, emoji, avatar, moderator, room id) to
  PostHog; rejected users are never identified.
- Analytics go to **PostHog** (product analytics, self-hosted proxy at
  `t.voting.poker`). Rooms are grouped by room id
  (`SessionPage.useRoomId` → `posthog.group("Room", roomId)`).

See the repository [`README.md`](../README.md) for the user-facing privacy
advisory and data-collection details.

## Helper modules

| Helper | Purpose |
|---|---|
| `shared/utils/link.ts` | `generateRoomId` (UUID), `getRoomUrl`, `toNewRoom` (navigate to a new room). |
| `shared/utils/avatarProps.ts` | Build MUI `<Avatar>` props from name/avatar. |
| `shared/utils/stringToColor.ts` | Deterministic color from a string (avatar fallback). |
| `shared/utils/valueColorScale.ts` + `percentageToColor.ts` | Map an estimate value to a color/height on a `log10` scale. |
| `shared/utils/toBase64.ts` | Encode uploaded avatar images. |
| `features/analytics/analytics.ts` / `debugAnalytics.ts` | PostHog identify + consent; dev-mode debug proxy. |
