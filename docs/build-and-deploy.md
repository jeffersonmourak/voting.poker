# Build, Pre-rendering & Deployment

> Sources: `scripts/`, `src/index.tsx`, `src/*-bootstrap.tsx`, `package.json`,
> `bunfig.toml`, `.github/workflows/`

Voting Poker is built and served as **static files**. There is no runtime server
in production — the same artifacts that GitHub Pages serves could be opened from
any static host. This document covers how those artifacts are produced, the
two-entry-point pre-render, the GitHub Pages routing trick, and CI/CD.

## Toolchain

Everything runs on [Bun](https://bun.sh/): it's the package manager, the dev
server, the test-free task runner, and — via `Bun.build` — the production
bundler. `bunfig.toml` registers the `bun-image-transform` plugin and inlines env
vars for the static server.

## npm scripts

| Script | Command | Use |
|---|---|---|
| `dev` | `bun run scripts/devGenerate.ts && bun --hot src/index.tsx` | Local development with hot reload. |
| `build` | `bun run scripts/build.ts` | Produce the static `dist/` for deployment. |
| `start` | `bun src/index.tsx` | Serve a production build locally via the Bun server. |

`dev` and `dev`'s `BUN_PUBLIC_SITE_HOST=localhost:3000` make URLs resolve against
localhost; `build` runs with `NODE_ENV=production` so `isDev`
(`src/app/constants.ts`) is false and the real `voting.poker` base URL is used.

## The two entry points

The app pre-renders **two separate HTML documents**, each booting a different
React tree:

| Generated file | Bootstrap script | React root | Served as |
|---|---|---|---|
| `_generated_index.html` | `home-bootstrap.tsx` | `App` (the `Home` landing page) | `index.html` → `/` |
| `_generated_404.html` | `session-bootstrap.tsx` | `Session` (the room SPA) | `404.html` |

- `home-bootstrap.tsx` **hydrates** the server-rendered landing markup
  (`hydrateRoot`).
- `session-bootstrap.tsx` **creates a fresh root** (`createRoot`) — the room app
  is client-only (its server markup is an empty shell), so there's nothing to
  hydrate.

Both bootstraps support Bun's hot-module-reloading by stashing the root on
`import.meta.hot.data` in development.

## Static generation pipeline

`scripts/codegen.tsx` → `scripts/generatePages.ts` → `scripts/build.ts`:

```
generatePages()
  1. bundleMeta(SEOMeta)
        · For meta entries ending in "image"/"icon", Bun-bundle the asset
          (e.g. the Open Graph PNG) to dist/ and rewrite the meta `content`
          to the hashed, absolute URL.
  2. generateStaticHTML(App,     _generated_index.html, home-bootstrap)
     generateStaticHTML(Session, _generated_404.html,   session-bootstrap)
        · renderToString the component wrapped in Emotion CacheProvider +
          MUI ThemeProvider + CssBaseline.
        · extractCriticalToChunks → inline only the critical Emotion CSS.
        · renderFullPage stitches <head> (title, meta, critical CSS, favicon,
          globals.css) + <body> (#root markup + bootstrap <script>).
        · rewrite absolute src paths back to "." so assets resolve relatively.
  3. returns a cleanup() that deletes the temp _generated_* files afterward.
```

Then `scripts/build.ts`:

```
build.ts
  1. const cleanup = await generatePages()
  2. Bun.build(_generated_index.html)  → dist/  (sourcemaps, browser target)
  3. Bun.build(_generated_404.html)    → dist/  (+ BunImageTransformPlugin,
                                                  env: "BUN_PUBLIC_*" inlined)
  4. rename dist/_generated_index.html → dist/index.html
     rename dist/_generated_404.html   → dist/404.html
  5. await cleanup()  (remove the temp generated sources)
```

Bun follows the `<script type="module">` references in each HTML file, bundles
the React app into hashed `chunk-*.js`/`*.css` files, and emits everything into
`dist/`. The `_generated_*.html` files are intermediate build artifacts (and are
git-ignored).

`scripts/devGenerate.ts` is just `generatePages()` without the bundling step — it
regenerates the HTML before the hot dev server starts.

## The GitHub Pages routing trick

This is how a backend-less static site supports arbitrary room URLs like
`voting.poker/3f9a-…`:

```
Request                         GitHub Pages serves        Boots
────────────────────────────────────────────────────────────────────────
/                            →  index.html             →  Home (landing)
/<any-room-id> (no such file)→  404.html                →  Session (room SPA)
```

GitHub Pages returns `404.html` for **any path that doesn't map to a real file**.
Since no file named after a room id exists, every room URL falls through to
`404.html` — which is the room app. The app then reads the room id straight from
the URL:

```ts
// src/features/room/SessionPage.tsx
const roomId = location.href.split("/").pop();
```

So no client-side router is needed: the "route" is just the last path segment,
and a missing-page handler is repurposed as the SPA entry. Creating a room
(`shared/utils/link.ts → toNewRoom`) simply sets `window.location.href` to
`<BASE_URL>/<uuid>`.

### The dev/`start` server

`src/index.tsx` is a tiny `Bun.serve()` that mirrors this in environments where
there's no GitHub Pages 404 behavior:

```ts
serve({
  routes: {
    "/": index,      // _generated_index.html (the landing page)
    "/*": notFound,  // _generated_404.html  (the room app)
  },
  development: process.env.NODE_ENV !== "production",
});
```

`"/" → index`, everything else `→ notFound` (the Session app) — the same split as
production, so room URLs work locally too.

## Configuration & secrets

- **`src/app/constants.ts`** holds the public Ably and Giphy keys. These are
  client-side **publishable** keys (the app is keyless/authless by design), so
  they ship in the bundle. `isDev`, `siteHost`, and `BASE_URL` are derived here
  from `NODE_ENV` / `BUN_PUBLIC_SITE_HOST`.
- **`.env`** in the repo root contains legacy `NEXT_PUBLIC_FIREBASE_*` /
  `NEXT_PUBLIC_REACT_APP_API_URL` keys. They are **not referenced** by the
  current Bun/React codebase (leftovers from an earlier Next.js/Firebase
  incarnation) and are git-ignored.
- **`CNAME`** pins the custom domain `voting.poker`.

## CI/CD

> Source: `.github/workflows/`

### Deploy (`bun.yaml`)

On every push to `main`:

1. **build** — checkout, `setup-bun`, `bun install`, `bun run build`, then upload
   `dist/` as a GitHub Pages artifact.
2. **deploy** — publish the artifact to GitHub Pages (`actions/deploy-pages`).

The site goes live at `voting.poker` (the `CNAME` domain).

### Dependency upgrades (the second workflow)

A scheduled workflow (Mondays 05:00 UTC, plus manual dispatch) runs `bun update`
— which respects the SemVer ranges in `package.json`, so only non-breaking
updates are pulled — and opens a `chore: upgrade dependencies` PR via
`create-pull-request`. The recent commit history (`chore: upgrade dependencies`
merges) is this automation at work.

## Output layout (`dist/`)

A production build yields roughly:

```
dist/
├─ index.html                 # landing page (hydrated)
├─ 404.html                   # room SPA + GitHub Pages fallback
├─ chunk-*.js / chunk-*.css   # hashed bundled app code + critical/extracted CSS
├─ *.map                      # external source maps
├─ favicon.ico, globals.css
└─ <hashed media assets>      # OG image, Giphy badge, Brazuca illustrations, …
```
