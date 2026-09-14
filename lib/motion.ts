/**
 * Device sensor permissions. iOS 13+ requires an explicit request from
 * inside a user gesture (a button's onClick) for BOTH orientation and
 * motion data — there's no way to prompt for either lazily, and they're
 * gated separately (granting one doesn't grant the other). Android and
 * desktop have no such gate: the events just work there, or never fire at
 * all on hardware with no gyroscope/accelerometer. These resolve `true`
 * immediately on any platform without the gate, so callers can treat the
 * result as "go ahead" either way — they still need their own timeout
 * fallback for the "never fires" case, which this can't detect.
 */
type PermissionRequester = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

async function requestPermissionFor(
  ctor: PermissionRequester | undefined,
): Promise<boolean> {
  if (!ctor?.requestPermission) return true;
  try {
    return (await ctor.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

/** Needed by "Everything Go Wrong" (chaos mode) to read deviceorientation's `beta`. */
export function requestOrientationPermission(): Promise<boolean> {
  return requestPermissionFor(
    typeof DeviceOrientationEvent !== "undefined"
      ? (DeviceOrientationEvent as unknown as PermissionRequester)
      : undefined,
  );
}

/** Needed by "Everything Go Wrong" (chaos mode) to read devicemotion's acceleration. */
export function requestDeviceMotionPermission(): Promise<boolean> {
  return requestPermissionFor(
    typeof DeviceMotionEvent !== "undefined"
      ? (DeviceMotionEvent as unknown as PermissionRequester)
      : undefined,
  );
}
