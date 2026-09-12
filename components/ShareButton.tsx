"use client";

import { toast } from "sonner";
import { track } from "@/lib/analytics";

/** Tags the shared link with utm_source/utm_medium so visits from it show up
 *  as organic share-button traffic in analytics (PostHog auto-reads standard
 *  utm_* params on pageview, see lib/analytics.ts) — distinct from someone
 *  just pasting the bare app URL. Existing query/hash is stripped first so
 *  re-sharing an already-tagged link (e.g. a recipient sharing it onward)
 *  doesn't stack params or misattribute the new share. */
function taggedShareUrl(): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("utm_source", "share_button");
  url.searchParams.set("utm_medium", "organic");
  return url.toString();
}

/** "Like game? Share with friend" — sits under Start Game on the setup
 *  screen. Opens the native share sheet where supported, else copies the
 *  link and confirms via toast. Every attempt is tracked with its outcome —
 *  a cancelled share sheet is a real signal, not just noise to swallow. */
export default function ShareButton() {
  const share = async () => {
    const data = {
      title: "Ooga Tabooga",
      text: "Grunt one-syllable clues. Guess the words. Ug good!",
      url: taggedShareUrl(),
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        track("share_clicked", { method: "native", result: "sent" });
      } catch {
        // Cancelled share sheet — not an error, nothing to do.
        track("share_clicked", { method: "native", result: "cancelled" });
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      track("share_clicked", { method: "clipboard", result: "copied" });
      toast("Link copied — go grunt at your tribe!");
    } catch {
      track("share_clicked", { method: "clipboard", result: "failed" });
      toast("Couldn't copy the link — sorry, chief.");
    }
  };

  return (
    <button onClick={share} className="btn btn-cream w-full py-3 text-base">
      <span className="font-display">Like game? Share with friend 📣</span>
    </button>
  );
}
