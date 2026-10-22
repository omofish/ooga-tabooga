@AGENTS.md

# Ooga Tabooga

A mobile-first party word-guessing game built around a caveman one-syllable-clue
gimmick. Single-page Next.js 16 (App Router) app; **all logic is client-side**,
no backend.

## How the game works

Teams take turns. One player (the "clue giver") clues their team using **only
one-syllable words** — that caveman constraint is the whole gimmick. Each card
has two answers:

- **easy** word → **+1** (simple, the fallback)
- **hard** phrase → **+3** (harder, and it always *contains* the easy word)

On a timed turn (60/90/120s) the clue giver gets the team to guess as many cards as
they can: nail the hard phrase for +3, settle for the easy word for +1, or
pass/skip (−1). Highest total across rounds wins.

## ⭐ Most common task: word sets

Adding or editing a word set is the main reason to touch this repo. The card
rules are **strict and auto-audited** — always **read
[`docs/word-set-guidelines.md`](docs/word-set-guidelines.md) first**.

To add a set: create `lib/word-sets/<name>.ts` exporting `<NAME>_CARDS` (built
via `fromTable()`/`build()` from `lib/word-sets/gen.ts`), then register it in
`WORD_SETS` in `lib/word-sets/index.ts`. Then run the audit and fix every failure:

```bash
npm run audit
```

## Run / check

- `npm run dev` — dev server (Turbopack). PWA/offline are **prod-only**.
- `npm run build && npm run start` — production; needed to test PWA/offline.
- `npm run verify` — typecheck + lint + word-set audit. The only gate; CI and
  the deploy run the same script. A Stop hook runs it for you and won't let
  you finish while it's red.

## Git workflow

Merge straight to `main`, no PR and no approval wait. Work on your branch,
commit, then run:

```bash
npm run ship
```

It merges `origin/main`, runs verify, pushes the branch, waits for the CI
`verify` check on that exact commit, then fast-forwards `main` to it (retrying
if `main` moved). Never push to `main` any other way: a hook blocks it. On a
merge conflict, resolve it, commit, and run ship again.

After every push to `main`, report the commit hash (`git log -1 --format=%h`)
back to the user, so they can check it against the `build <hash>` footer shown
on the live site.

## Working with the user

- Start every chat message to the user with a 🐟 emoji.
- When adding a new feature, ask the user whether telemetry should be added
  for it before assuming either way (see `lib/analytics.ts` /
  [`docs/architecture.md`](docs/architecture.md#analytics) for the existing
  event pattern).

## Code map

Deeper detail (state machine, screen flow, styling gotchas) is in
[`docs/architecture.md`](docs/architecture.md). Quick version:

- `app/` — `layout.tsx` (fonts, metadata, PWA), `page.tsx` → `<Game/>`, `globals.css`.
- `components/` — one component per screen; `Game.tsx` routes by `state.phase`; `Modal` is the shared dialog.
- `lib/game.ts` — the reducer + all game logic + localStorage persistence (the brain).
- `lib/{colors,names,tribes}.ts` — team themes and default player/tribe names.
- `lib/solo.ts` — solo mode's "best single turn" records (own localStorage key).
- `lib/analytics.ts` — PostHog wrapper (`track()`/`initAnalytics()`); no-ops without a configured key. See [`docs/architecture.md`](docs/architecture.md#analytics).
- `lib/preset.ts` — shared setup links (`?pack=&mode=&time=&tribes=`): parse/validate, build, strip. See [`docs/architecture.md`](docs/architecture.md#url-presets-shared-setup-links).
- `lib/pwa.ts` — `isStandalone()`, shared by `AddToHomeScreen` and `lib/analytics.ts`.
- `lib/motion.ts` — `requestOrientationPermission()` / `requestDeviceMotionPermission()`, the iOS sensor permission gates used by the "Everything Go Wrong" (chaos) game mode.
- `lib/word-sets/` — `index.ts` (the `WORD_SETS` registry), `<set>.ts` (the sets), and `gen.ts` (build helpers).
- `docs/` — this documentation.

## Keep these docs current

These docs exist so a fresh agent can orient in seconds instead of re-reading the
tree — that only works if they stay accurate. **When you change how something
works, update the relevant doc in the same change.** Document the *current* state
only (no changelogs/history). If you notice a doc is stale, fix it.
