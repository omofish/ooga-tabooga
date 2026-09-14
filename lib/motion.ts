/**
 * Device-orientation permission. iOS 13+ requires an explicit request from
 * inside a user gesture (a button's onClick) or the browser silently
 * withholds sensor data forever — there's no way to prompt for it lazily.
 * Android and desktop have no such gate: `deviceorientation` just works
 * there, or never fires at all on hardware with no gyroscope. Callers that
 * depend on it ("Bat Swarm Attack") need their own timeout fallback for
 * that case — this can't detect "will never fire," only ask for permission.
 */
type OrientationPermissionRequester = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export function requestMotionPermission(): void {
  const ctor =
    typeof DeviceOrientationEvent !== "undefined"
      ? (DeviceOrientationEvent as unknown as OrientationPermissionRequester)
      : undefined;
  ctor?.requestPermission?.().catch(() => {});
}
