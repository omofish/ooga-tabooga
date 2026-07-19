# Architecture

Single-page client app: `app/page.tsx` → `<Game/>`. No routes, no server, no API.
The whole game runs in the browser; state persists to `localStorage`.

## State machine

One `useReducer` in `components/Game.tsx`, driven by the reducer in `lib/game.ts`,
saved to `localStorage` on every change.

- **Phases** (`state.phase`): `setup → score → countdown → play → review → reveal
  → (back to score) → gameover`. `Game.tsx` renders exactly one screen per phase.
- `state.active` is the in-progress turn: team, player, deck cursor, resolved
  cards, timer (`endsAt`), and manual `scoreAdjust`.
- `state.seen` remembers played cards per set so a fresh game deals unseen cards
  first (see `buildDeck`); the setup screen can reset it.
- **Solo mode** (`isSolo`, i.e. `numTeams === 1`): a single tribe with no
  opponent. The whole turn loop is unchanged (one column on the scoreboard); the
  goal is instead to beat your **best single turn**. Records live in `lib/solo.ts`
  under their own `localStorage` key (`pfn-best-turn-v1`), scoped per word set ×
  round length, so they survive new games. `ScoreReveal`/`ScoreView`/`GameOver`
  branch on `isSolo` to show and celebrate the record; the write happens in a
  `ScoreReveal` effect (the reducer stays pure).
- Persistence: `saveState`/`loadState`. **Bump `STATE_VERSION` when the persisted
  shape changes** (a version mismatch discards old saves, avoiding crashes).
  Where possible, default a new field instead (`x ?? 0`) so in-progress games
  aren't wiped.

## Screens (`components/`)

| Phase | Component | Role |
|---|---|---|
| setup | `SetupScreen` | choose tribes (1 = solo) / round length / word set |
| score | `ScoreView` | scoreboard; ▶ to play a turn, tap a team name to rename |
| — | `StartRoundModal`, `RenameTeamModal` | shown over the scoreboard |
| countdown | `Countdown` | 3·2·1·GO |
| play | `Gameplay` | the timed turn (cards, timer, pause/restart) |
| review | `RoundReview` | drag cards into +3/+1/−1 buckets, manual ±, bank |
| reveal | `ScoreReveal` | animated turn score |
| gameover | `GameOver` | winner / standings (solo: best-turn summary vs record) |

`Modal` is the standard dialog — reuse it; never hand-roll an overlay or use
`window.confirm`. `HowToPlay` (a flat "?" button that opens the rules in a
`Modal`) sits in the top-left of `SetupScreen`, mirroring the `MuteToggle`.

## Styling (Tailwind v4 in `app/globals.css`) — gotchas

- **Custom classes are unlayered and outrank Tailwind utilities.** `.btn` sets
  `position: relative`, so `.btn.absolute` is NOT absolutely positioned — a
  positioned button must not use `.btn`. Watch for this with any property a
  custom class also sets.
- **Display font (Luckiest Guy) sits ~0.145em high in its box** — it's all-caps
  with no descenders but keeps a big phantom descent. `.font-display` is the
  single fix and must go on the element that *directly* wraps the text run: a
  heading, or a `<span>` around a button label — **never a `.btn` or flex/grid
  container** (a `.btn` carries its own `:active` transform and its box/shadow
  must not move, and the trim can't reach a bare text node inside a flex box).
  So a button is `<button class="btn …"><span class="font-display">Label</span></button>`,
  not `font-display` on the button. The class self-corrects in every engine:
  `text-box-trim` where supported, an `inline-block` + `translateY(0.14em)` nudge
  where not (Firefox, Samsung Internet). Opt giant numerals (countdown/reveal)
  out with `.no-text-trim`, or their round tops clip.
- Chunky "sticker" aesthetic: `.chunk` / `.btn`, hard drop-shadows, and per-team
  `--team-*` CSS vars applied with `colorVars()` from `lib/colors.ts`.
- **Flat icons, not emoji, for buttons/controls.** A control's icon must be a
  flat inline-SVG, a shaped `<span>`, or a display-font glyph — all using
  `currentColor` and sized in `em` / `text-*`. See `PauseIcon` (`Gameplay.tsx`),
  `MuteToggle`'s speaker SVG, the `Modal` close "✕", and `HowToPlay`'s display-
  font "?". Emoji render inconsistently across platforms and ignore theme color,
  so never use an emoji glyph as a control's icon. (Decorative emoji inside text
  labels/headings/hints are fine.)

## Sound & haptics

`lib/sound.ts` is a tiny WebAudio engine: every tone is **synthesised at runtime**
with an `OscillatorNode`, so there are no audio files and the offline PWA needs no
extra cached assets. Screens call the semantic helpers (`bank`, `big`, `pass`,
`tick`, `timeUp`, `beep`, `go`, `reveal`, `win`, `announce`) and `vibrate()` from
their event handlers/effects — **the reducer stays pure** (no side effects in
`lib/game.ts`). `announce()` is the one exception to "no audio files": it layers a
short fanfare chime with a spoken milestone via the Web Speech API (system voice,
still offline-safe).

- Playback is a no-op until `unlockAudio()` runs inside a user gesture (browser
  autoplay policy). It's called on "Start Game", "Start Round", and the mute
  toggle, and **also primes speech synthesis** — browsers (esp. iOS Safari) drop
  timer-driven `speechSynthesis.speak()` unless speech was first invoked during a
  gesture, so `announce()` would otherwise stay silent.
- A single **mute flag** gates both sound *and* haptics, persisted under its own
  `localStorage` key (`pfn-muted`) — separate from game state, so **no
  `STATE_VERSION` bump**. `useMuted()` (a `useSyncExternalStore` hook) drives the
  shared `MuteToggle` button on `SetupScreen` and in the `Gameplay` header.
- `Gameplay` ticks once **every** second: a calm ambient tick that, through the
  final 10, jumps to a fixed higher pitch/volume **and** switches to double time
  (an extra off-beat tick at +0.5s, so the pulse runs twice as fast); spoken
  `announce()` at the 90/60/30/10-second marks (only those below the turn length),
  then the time-up buzzer with a spoken "Time's up!".
- A single document-level `click` listener in `Game.tsx` plays a soft `click()`
  on **every** button press app-wide (mouse, touch, or keyboard activation);
  screens with their own richer sounds just layer over it. `MuteToggle` renders a
  flat inline-SVG speaker (`currentColor`), not an emoji.

## Word sets

Everything word-set lives under `lib/word-sets/`. `index.ts` registers every set
in `WORD_SETS`. Each set is `lib/word-sets/<name>.ts` exporting `<NAME>_CARDS`,
built from a compact table through `fromTable()`/`build()` in
`lib/word-sets/gen.ts`, which **enforces the containment rule** (hard phrase must
contain the easy word) and dedupes. Authoring rules and the audit script:
[`word-set-guidelines.md`](word-set-guidelines.md).

## PWA / offline

`public/manifest.webmanifest` + `public/sw.js` (cache-first, app-shell fallback)
+ `components/ServiceWorkerRegister.tsx` (registers **in production only**).
Icons in `public/`, metadata/apple tags wired in `app/layout.tsx`. Only works in
a production build (`npm run build && npm run start`), not dev.
