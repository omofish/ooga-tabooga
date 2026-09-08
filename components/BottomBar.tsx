"use client";

/** Chrome-colour partner to <TopBar/>: a thin sticky strip at the very
 *  bottom of every screen, purely so iOS Safari's chrome-colour sampling has
 *  a bottom-edge element to match — no visible content of its own, coloured
 *  to exactly match whatever's already there (see `bottomBarTheme()`,
 *  lib/colors.ts) so it adds no visible seam. `key` (passed by the caller)
 *  is load-bearing, not incidental — see the comment on `topBarTheme`. */
export default function BottomBar({ background }: { background: string }) {
  return (
    <div aria-hidden className="sticky bottom-0 z-40 h-2" style={{ background }} />
  );
}
