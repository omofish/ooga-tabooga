@AGENTS.md

# Ooga Tabooga

A mobile-first party word-guessing game — a clone of **Poetry for Neanderthals**.
Single-page Next.js 16 (App Router) app; **all logic is client-side**, no backend.

## How the game works

Teams take turns. One player (the "poet") clues their team using **only
one-syllable words** — that caveman constraint is the whole gimmick. Each card
has two answers:

- **easy** word → **+1** (simple, the fallback)
- **hard** phrase → **+3** (harder, and it always *contains* the easy word)

On a timed turn (60/90/120s) the poet gets the team to guess as many cards as
they can: nail the hard phrase for +3, settle for the easy word for +1, or
pass/skip (−1). Highest total across rounds wins.

## ⭐ Most common task: word sets

Adding or editing a word set is the main reason to touch this repo. The card
rules are **strict and auto-audited** — always **read
[`docs/word-set-guidelines.md`](docs/word-set-guidelines.md) first**.

To add a set: create `lib/<name>.ts` exporting `<NAME>_CARDS` (built via
`fromTable()`/`build()` from `lib/gen.ts`), then register it in `WORD_SETS` in
`lib/words.ts`. Then run the audit and fix every failure:

```bash
npx tsx scripts/audit-word-sets.mts
```

## Run / check

- `npm run dev` — dev server (Turbopack). PWA/offline are **prod-only**.
- `npm run build && npm run start` — production; needed to test PWA/offline.
- `npm run lint` and `npx tsc --noEmit` — run both before every commit.

## Git workflow

By default, agents should merge their changes to `main` automatically once the
work is complete and checks pass — no need to wait for explicit approval to
merge.

## Code map

Deeper detail (state machine, screen flow, styling gotchas) is in
[`docs/architecture.md`](docs/architecture.md). Quick version:

- `app/` — `layout.tsx` (fonts, metadata, PWA), `page.tsx` → `<Game/>`, `globals.css`.
- `components/` — one component per screen; `Game.tsx` routes by `state.phase`; `Modal` is the shared dialog.
- `lib/game.ts` — the reducer + all game logic + localStorage persistence (the brain).
- `lib/{colors,names,tribes}.ts` — team themes and default player/tribe names.
- `lib/words.ts` + `lib/<set>.ts` + `lib/gen.ts` — word-set registry, the sets, and build helpers.
- `docs/` — this documentation.

## Keep these docs current

These docs exist so a fresh agent can orient in seconds instead of re-reading the
tree — that only works if they stay accurate. **When you change how something
works, update the relevant doc in the same change.** Document the *current* state
only (no changelogs/history). If you notice a doc is stale, fix it.
