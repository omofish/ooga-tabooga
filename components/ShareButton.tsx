"use client";

import { toast } from "sonner";

/** "Like game? Share with friend" — sits under Start Game on the setup
 *  screen. Opens the native share sheet where supported, else copies the
 *  link and confirms via toast. */
export default function ShareButton() {
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
    <button onClick={share} className="btn btn-cream w-full py-3 text-base">
      <span className="font-display">Like game? Share with friend 📣</span>
    </button>
  );
}
