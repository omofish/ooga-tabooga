"use client";

import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { addPresetParams } from "@/lib/preset";
import type { GameState } from "@/lib/types";

/** Tags the shared link with utm_source/utm_medium so visits from it show up
 *  as organic share-button traffic in analytics (PostHog auto-reads standard
 *  utm_* params on pageview, see lib/analytics.ts) — distinct from someone
 *  just pasting the bare app URL. Existing query/hash is stripped first so
 *  re-sharing an already-tagged link (e.g. a recipient sharing it onward)
 *  doesn't stack params or misattribute the new share. The current setup
 *  (pack / mode / time / tribes) rides along too, so the friend opens the
 *  same game (see lib/preset.ts). */
function taggedShareUrl(state: GameState): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  addPresetParams(url, state);
  url.searchParams.set("utm_source", "share_button");
  url.searchParams.set("utm_medium", "organic");
  return url.toString();
}

/** "Like game? Share with friend" — sits under Start Game on the setup
 *  screen. Opens the native share sheet where supported, else copies the
 *  link and confirms via toast. Every attempt is tracked with its outcome —
 *  a cancelled share sheet is a real signal, not just noise to swallow. */
export default function ShareButton({ state }: { state: GameState }) {
  const share = async () => {
    const data = {
      title: "Ooga Tabooga",
      text: "Grunt one-syllable clues. Guess the words. Ug good!",
      url: taggedShareUrl(state),
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        track("share_clicked", { method: "native", result: "sent", withPreset: true });
      } catch {
        // Cancelled share sheet — not an error, nothing to do.
        track("share_clicked", { method: "native", result: "cancelled", withPreset: true });
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      track("share_clicked", { method: "clipboard", result: "copied", withPreset: true });
      toast("Link with your setup copied — go grunt at your tribe!");
    } catch {
      track("share_clicked", { method: "clipboard", result: "failed", withPreset: true });
      toast("Couldn't copy the link — sorry, chief.");
    }
  };

  return (
    <button onClick={share} className="btn btn-cream w-full py-3 text-base">
      <span className="font-display">Like game? Share with friend 📣</span>
    </button>
  );
}
