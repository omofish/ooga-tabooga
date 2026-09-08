"use client";

import HowToPlay from "./HowToPlay";
import MuteToggle from "./MuteToggle";

/** The app's persistent top bar — every screen, always. `sticky` (not
 *  `fixed`) so it reserves its own space in flow instead of needing every
 *  screen to add matching padding-top, but stays pinned once content scrolls
 *  past it.
 *
 *  `background`/`text` come from `topBarTheme()` (lib/colors.ts) — Game.tsx
 *  also passes that theme's `key` as this component's React `key`, which is
 *  load-bearing: see the comment on `topBarTheme` for why a colour change
 *  needs a real remount (not just new props) to get picked up by iOS 26
 *  Safari's chrome-colour sampling. */
export default function TopBar({
  background,
  text,
}: {
  background: string;
  text: string;
}) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-2"
      style={{ background }}
    >
      <HowToPlay className="btn btn-cream flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink" />
      <h1 className="font-display text-lg" style={{ color: text }}>
        🦴 Ooga Tabooga
      </h1>
      <MuteToggle className="btn btn-cream flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink" />
    </header>
  );
}
