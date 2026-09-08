"use client";

/** Chrome-colour partner to <TopBar/>: a thin sticky strip at the very
 *  bottom of Setup and Score (the only screens it's mounted on), purely so
 *  iOS Safari's chrome-colour sampling has a bottom-edge element to match —
 *  no visible content of its own. Matches `--color-body`, the flat
 *  background those two screens use, so it adds no visible seam. */
export default function BottomBar() {
  return (
    <div
      aria-hidden
      className="sticky bottom-0 z-40 h-2"
      style={{ background: "var(--color-body)" }}
    />
  );
}
