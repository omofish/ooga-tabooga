"use client";

/**
 * Invisible `position: fixed` strips pinned at the very top and bottom edges
 * of the viewport, coloured to exactly match whatever's already there.
 *
 * iOS 26 Safari dropped support for `<meta name="theme-color">` entirely —
 * confirmed via https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/
 * and https://nasedk.in/blog/ios26-safari-toolbar-colors/. It now derives its
 * own chrome colour (the status-bar strip, and its own bottom toolbar) by
 * sampling the `background-color` of a `position: fixed`/`sticky` element
 * that sits right at an edge — within a few px, spanning most of the
 * viewport width — at render time only (no re-sampling on later JS/state
 * changes). Falls back to `<body>`'s own `background-color` (a *solid*
 * colour only — gradients/background-image are ignored) if no such element
 * qualifies.
 *
 * These two strips exist purely as that signal: sized well past the
 * documented minimums (full width, 8px tall vs. a ~3px floor, flush at the
 * edge), `pointer-events: none` so they never intercept a tap, and coloured
 * via `chromeEdgeColors()` (lib/colors.ts) to the exact value each screen
 * already renders at that edge — so they add no visible seam of their own.
 *
 * Known limitation, not fixed here: a `Modal`'s backdrop is a translucent
 * `fixed inset-0` layer, and per the sources above a *translucent* edge
 * element makes Safari's sampled colour depend on whatever's rendered
 * beneath it — an open, unresolved WebKit bug, not something fixable from
 * the page's CSS alone. The chrome may read a little unpredictable while a
 * modal is open; it settles back to the right colour once it closes.
 */
export default function ChromeEdges({
  top,
  bottom,
}: {
  top: string;
  bottom: string;
}) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[1000] h-2"
        style={{ background: top }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] h-2"
        style={{ background: bottom }}
      />
    </>
  );
}
