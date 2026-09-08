"use client";

import HowToPlay from "./HowToPlay";
import MuteToggle from "./MuteToggle";

/** The app's persistent top bar — every screen, always. `sticky` (not
 *  `fixed`) so it reserves its own space in flow instead of needing every
 *  screen to add matching padding-top, but stays pinned once content scrolls
 *  past it. Flat `bg-ink`, no gradient, so it (and `body`'s own solid dark
 *  background, see globals.css) are the only things iOS 26 Safari ever needs
 *  to sample for its chrome colour — see docs/architecture.md. */
export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 bg-ink px-3 py-2">
      <HowToPlay className="btn btn-cream flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink" />
      <h1 className="font-display text-lg text-cream">🦴 Ooga Tabooga</h1>
      <MuteToggle className="btn btn-cream flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink" />
    </header>
  );
}
