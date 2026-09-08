"use client";

import { toast } from "sonner";

/** Round share button: opens the native share sheet where supported, else
 *  copies the link and confirms via toast. Self-contained, same shape as
 *  <HowToPlay/> and <MuteToggle/> so it drops into the same icon row. */
export default function ShareButton({ className }: { className?: string }) {
  const share = async () => {
    const data = {
      title: "Ooga Tabooga",
      text: "Grunt one-syllable clues. Guess the words. Ug good!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // Cancelled share sheet — not an error, nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      toast("Link copied — go grunt at your tribe!");
    } catch {
      toast("Couldn't copy the link — sorry, chief.");
    }
  };

  return (
    <button
      onClick={share}
      aria-label="Share Ooga Tabooga"
      className={
        className ??
        "btn btn-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
      }
    >
      <ShareIcon className="h-5 w-5" />
    </button>
  );
}

/** Flat "share" glyph (currentColor): three nodes, connected. */
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden focusable="false">
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8.2 10.6L15.8 6.4M8.2 13.4L15.8 17.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
