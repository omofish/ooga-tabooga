"use client";

import { toggleMuted, unlockAudio, useMuted } from "@/lib/sound";

/** Round speaker button that toggles (and persists) all game sound + haptics. */
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
      <VolumeIcon muted={muted} className="h-5 w-5" />
    </button>
  );
}

/** Flat speaker glyph (currentColor): sound waves when on, an X when muted. */
function VolumeIcon({ muted, className }: { muted: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden focusable="false">
      <path
        d="M3 9H8L13 5V19L8 15H3Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {muted ? (
        <path
          d="M16.5 9.5L21 14M21 9.5L16.5 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
