/** True once installed/launched as a standalone app — Android's
 *  `display-mode` media feature, or iOS Safari's non-standard
 *  `navigator.standalone` (no `display-mode` support there). Shared by
 *  AddToHomeScreen (hides the install nudge) and analytics (tags events with
 *  whether the game is running installed vs. in a regular browser tab). */
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
