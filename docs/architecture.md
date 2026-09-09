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

`TopBar` is chrome shown only on Setup and Score (`Game.tsx` renders it
behind `state.phase === "setup" || state.phase === "score"`) — the two
screens without their own full-bleed themed background. It's a slim bar
(`?`/title/mute), `position: sticky top-0`, fixed dark-ink colour, no props,
no per-phase theming. There's deliberately **no** bottom counterpart — see
"Browser chrome colour" below for why a bottom-edge bar was tried and
removed. Every other phase (`countdown`/`play`/`review`/`reveal`/`gameover`)
owns the full viewport itself and renders no bar at all.

Every phase component other than Setup/Score sizes its own outer element to
the full viewport (`min-h-[100svh]`, or `Gameplay`'s `h-[100svh]` since it
must never scroll: `touch-none` + `overflow-hidden`, deliberately, so a
stray drag mid-tap can't be stolen as a scroll) — there's no shared bar
eating into that space on those screens, so each owns its own background
edge-to-edge. `Gameplay` embeds its own header (mute, timer, pause) since
`TopBar` isn't mounted there. `SetupScreen` and `ScoreView` set no
background of their own either — they leave `<body>`'s colour + polka-dot
texture (`globals.css`) showing through.

`Game.tsx` also resets scroll (`window.scrollTo(0, 0)`) in a `useEffect`
keyed on `state.phase` — client-side phase transitions aren't real
navigations, so without this the browser leaves the next screen scrolled to
whatever offset the previous one was at (e.g. starting a game while
scrolled down on Setup would land Score scrolled to that same offset).

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
  `STATE_VERSION` bump**. `useMuted()` (a `useSyncExternalStore` hook) drives
  `MuteToggle`, embedded separately in `TopBar` (Setup/Score) and in
  `Gameplay`'s own header (Play) since the two never share a screen.
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

## Safe areas (notch / Dynamic Island / home indicator)

`viewport.viewportFit: "cover"` (`app/layout.tsx`) and `appleWebApp.statusBarStyle:
"black-translucent"` extend the page under the status bar and home indicator
instead of leaving them as separate native chrome — otherwise, in an installed
iOS PWA, the status bar renders as a flat opaque strip that doesn't match the
app's own colours (a visible seam between it and whatever's rendered below).

Because content now draws under both edges, every edge-anchored element pads
itself with `env(safe-area-inset-top)`/`env(safe-area-inset-bottom)` **on top
of** its normal spacing (`pt-[calc(env(safe-area-inset-top)+1.25rem)]`, etc.)
so controls stay clear of the notch/home indicator: `TopBar` (top), and the
top and/or bottom edges of `Gameplay` (header + footer), `RoundReview`,
`GameOver`, `SetupScreen`, `ScoreView`. Centered full-viewport screens
(`Countdown`, `ScoreReveal`) don't touch an edge, so they're left alone. `html`
also gets the same `background-color` as `body` — with content now able to
rubber-band past `body`'s own bounds, this stops the unstyled (white) `html`
background from flashing through the gap.

## Browser chrome colour (status bar / bottom toolbar)

There's no `<meta name="theme-color">` — iOS 26 Safari (its "Liquid Glass"
chrome) ignores it entirely. Instead, for each edge (top/bottom) it finds the
nearest qualifying element — `position: fixed`/`sticky`, at least ~80% of
the viewport width, within a few px of that edge — and **mirrors both its
`background-color` and its `backdrop-filter`** onto its own native chrome.
With no qualifying element at that edge, it falls back to sampling
`<body>`'s own `background-color` for tint *only*, while keeping its own
native translucent/blurred glass rendering intact. `<body>` stays the plain
light/cream base tint (`#e3d2b3`) — that's the app's actual page background,
a separate concern from chrome colour; don't make `<body>` itself dark to
chase a chrome-colour goal (tried once, reverted — broke every screen's text
contrast for no real benefit once the mechanism below was understood).

**This is why `TopBar` has no bottom counterpart.** An earlier version added
a `BottomBar` — a solid, opaque, full-width sticky strip — specifically to
give the bottom edge a colour to sample, mirroring `TopBar`. It worked for
colour, but it also cost translucency: because it was a *qualifying edge
element*, Safari mirrored it exactly — flat and opaque, since the element
itself had no `backdrop-filter` and a fully-opaque `background-color` — which
replaced Safari's native frosted-glass bottom toolbar with a dead flat strip.
Removing it restores the fallback path: no qualifying element at the bottom
edge on any screen, so Safari's bottom toolbar is always its own native
translucent glass, tinted by (and blurring) whatever `<body>` is currently
showing. (A `BottomBar` with a semi-transparent `background-color` **and**
`backdrop-filter: blur(...)` would, per the mechanism above, let Safari
mirror an intentionally-glassy bar instead of an opaque one — untried here;
removing it entirely was simpler and sufficient.)

**The sampling is real-time re-render-aware, but not real-time re-style-aware
— know the difference before touching this.** Restyling a `background-color`
on an element that stays mounted does *not* get re-sampled — confirmed: an
earlier version of `TopBar` was permanently mounted app-wide and only had its
colour prop change per `state.phase`, and Safari never picked the change up,
stuck forever on whatever colour was true at the very first paint. But a
genuine DOM *mount/unmount* of a qualifying element — removing one edge
element and inserting a differently-coloured one — **does** get re-sampled on
the next paint. This is why `TopBar` is scoped to
`state.phase === "setup" || state.phase === "score"` rather than
permanently mounted with a colour prop: each conditional render is a real
mount/unmount, so Safari picks up dark top chrome on Setup/Score and falls
back to sampling `<body>`'s tint on every other phase (and at the bottom
edge on *every* phase, top-chrome scoping included) — no forced-remount
`key` trick needed, since `TopBar`'s own colour never changes while it stays
mounted.

Every other phase (`countdown`/`play`/`review`/`reveal`/`gameover`) renders
no bar at all — top or bottom — so on those screens the chrome colour (both
edges) is whatever `<body>` falls back to. `Game.tsx` keeps that fallback
correct with a `useEffect`
keyed on `state.phase`/`state.active?.teamId` that sets
`document.body.style.backgroundColor` directly to match the active phase's
own theme (team `base` behind countdown/play/reveal, team `soft` behind
review; cleared back to the CSS default on setup/score/gameover, which
don't need an override). This isn't only for the chrome fallback: every
phase's own div is opaque and exactly viewport-sized, but an iOS rubber-band
overscroll bounce briefly reveals whatever's *behind* it — i.e. `<body>`
itself — so leaving `<body>` on its default cream would flash cream behind,
say, RoundReview's pink. The same effect also blanks `<body>`'s
`background-image` (the polka-dot texture, see below) while a colour
override is active, so the overscroll peek is a clean flat match rather
than the dot texture showing through a mismatched hue.

`<body>`'s own `background-image` (`globals.css`) is a polka-dot texture
only — the earlier version also layered two soft radial-gradient "highlight"
blobs, dropped since they're not wanted anymore. `SetupScreen` and
`ScoreView` set no background of their own, so this is what shows through on
those two screens (plus `TopBar`'s dark strip on top) — including through
Safari's translucent bottom chrome there, which blurs whatever `<body>` is
actually showing.

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
