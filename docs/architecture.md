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
- Teams alternate strictly, one at a time. `ScoreView` shows a single Play
  button for whichever team is next (`nextUpTeamId`); tapping it dispatches
  `OPEN_MODAL`, which appends a fresh round automatically once every team has
  a result for the current one (`roundComplete`) — there's no separate
  "next round" action. `END_GAME` is only enabled once every team has played
  the same number of turns (`roundsBalanced`).
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
| setup | `SetupScreen` | choose tribes (1 = solo) / round length / word set; `ShareButton` sits under Start Game |
| score | `ScoreView` | scoreboard; one Play button for the team up next, tap a team name to rename |
| — | `StartRoundModal`, `RenameTeamModal` | shown over the scoreboard |
| countdown | `Countdown` | 3·2·1·GO |
| play | `Gameplay` | the timed turn (cards, timer, pause/restart) |
| review | `RoundReview` | drag cards into +3/+1/−1 buckets, manual ±, bank |
| reveal | `ScoreReveal` | animated turn score |
| gameover | `GameOver` | winner / standings (solo: best-turn summary vs record) |

`Modal` is the standard dialog — reuse it; never hand-roll an overlay or use
`window.confirm`. It wraps `@radix-ui/react-dialog` (Radix), which supplies a
real focus trap, Escape/outside-tap dismiss, and — the reason it replaced a
hand-rolled `<div>` overlay — background scroll lock, so the page behind a
dialog can't be scrolled while it's open. Every call site passes a `title`
string; it's rendered `sr-only` as the dialog's accessible name (each caller
already shows its own heading visually, so this doesn't duplicate it).
`HowToPlay` (a flat "?" button that opens the rules in a `Modal`) lives in
`TopBar`, mirroring `MuteToggle`.

`TopBar` is the app's persistent chrome: a slim, flat `bg-ink` bar
(`?`/title/mute), `position: sticky top-0`, rendered once in `Game.tsx`
*outside* the phase switch, so it's on every screen including the
pre-hydration loading placeholder. Because it's `sticky` rather than `fixed`,
it reserves its own space in the shared flex column instead of every screen
needing matching `padding-top` — which is also why every phase component
uses `flex-1` (not its own `min-h-[100svh]`/`h-[100svh]`) for its outer
height: `<main>` alone carries `min-h-[100svh]`, and a child re-asserting a
*second*, independent `100svh` on top of that stacks with TopBar's own
height and overflows the real viewport by exactly that amount — the app
becomes scroll-able by a few dozen px on screens that must never scroll
(`Gameplay` in particular: `touch-none` + `overflow-hidden`, deliberately, so
a stray drag mid-tap can't be stolen as a scroll). `flex-1` fills whatever's
actually left after TopBar, no arithmetic required. `Gameplay` also embeds
its own header (timer, pause) but does *not* duplicate `MuteToggle` there
any more — TopBar's is the only one, app-wide.

`sonner` (`<Toaster/>` mounted once in `app/layout.tsx`, themed to the cream/
ink palette in `globals.css`) is the toast system — call `toast("message")`
from anywhere. Used for transient feedback that doesn't need a dialog, e.g.
ScoreView's End Game button while it's not yet valid to end (round not done,
or no round played at all): the button stays a real, clickable `<button
aria-disabled>` (not the native `disabled` attribute, which would swallow the
click) so tapping it can explain why via a toast instead of silently doing
nothing.

The scrollbar is themed globally in `globals.css` (not opt-in per element) so
any scrollable area — inside a `Modal` or a full-screen phase alike — gets
the same always-visible, in-theme treatment; give a scrollable container its
own right-hand padding (see `HowToPlay`'s rules panel) so the bar doesn't sit
on top of the last few characters of text.

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
  one shared `MuteToggle` button, in `TopBar`.
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

## Browser chrome colour (status bar / bottom toolbar)

There's no `<meta name="theme-color">` — iOS 26 Safari ignores it entirely.
Instead it derives its own chrome colour by sampling the `background-color`
of a `position: fixed`/`sticky` element flush with the top or bottom edge
(full width), falling back to `<body>`'s own solid `background-color`
otherwise — **at initial render only, never re-sampled on later state
changes.** That rules out targeting it *per screen/phase*: this is a 100%
client-rendered SPA, every phase change happens *after* first paint (which
is always the same pre-hydration loading placeholder, before React even
knows which phase to show), so a colour that only varies by `state.phase`
would never actually be picked up — it'd be stuck on whatever the very
first frame happened to be, forever, regardless of later phase changes
(this was tried and reverted once already).

What *is* achievable, and is what's live: one consistent colour, everywhere.
`body`'s `background-color` (not the gradient `background-image` layered
over it — Safari disregards that for this) is solid dark ink
(`var(--color-ink)`), and `TopBar` (`position: sticky`, full width, flush
with the top) is the same solid ink — so both the documented top-level rule
and its fallback agree, top and bottom, on every screen, "legitimately"
(i.e. via the actual supported mechanism, not a decoy sentinel element).
Because `body`'s background-color is dark, loose text that isn't already
sitting on its own light card/surface (`.chunk`, a Modal, a team's `soft`
tint) needs `text-cream`/`text-cream/70` now, not `text-ink`/`text-ink-soft`
— see `SetupScreen`, `ScoreView`'s header, and `GameOver`'s headline for the
pattern; anything inside a light card keeps `text-ink`/`text-ink-soft`
exactly as before, unaffected.

## PWA / offline

`public/manifest.webmanifest` + `public/sw.js` (cache-first, app-shell fallback)
+ `components/ServiceWorkerRegister.tsx` (registers **in production only**).
Icons in `public/`, metadata/apple tags wired in `app/layout.tsx`. Only works in
a production build (`npm run build && npm run start`), not dev.

## Deployment (GitHub Pages + basePath)

`next.config.ts` builds a static export (`output: "export"`) served from
`https://<user>.github.io/ooga-tabooga/` — set via `basePath`, sourced from
`lib/base-path.ts`. `.github/workflows/deploy.yml` builds and publishes on
push to `main`. Because the site isn't at the domain root, anything that
references a `public/` asset by absolute URL has to account for the
basePath — Next only auto-prefixes bundler-managed assets (`_next/*`), not
raw `public/` files or app metadata:

- `app/layout.tsx` metadata (`icons`, `manifest`) uses **relative** paths
  (no leading `/`) so they resolve against the page, not the domain root.
- `public/manifest.webmanifest`'s `start_url`/`scope`/icon `src` are
  relative for the same reason (resolved relative to the manifest URL).
- `components/ServiceWorkerRegister.tsx` and `public/sw.js` can't use
  relative paths (a service worker's own script/scope URLs must be
  explicit), so the register call is prefixed with `BASE_PATH` and `sw.js`
  reads `self.registration.scope` instead of hardcoding `"/"`.
