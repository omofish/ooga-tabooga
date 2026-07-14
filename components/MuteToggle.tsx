"use client";

import { toggleMuted, unlockAudio, useMuted } from "@/lib/sound";

/** Round 🔊/🔇 button that toggles (and persists) all game sound + haptics. */
export default function MuteToggle({ className }: { className?: string }) {
  const muted = useMuted();
  return (
    <button
      onClick={() => {
        // Toggling is a user gesture — a good moment to unlock audio so the
        // next sound can play immediately after unmuting.
        unlockAudio();
        toggleMuted();
      }}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      aria-pressed={muted}
      className={
        className ??
        "btn btn-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
      }
    >
      <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
