"use client";

import HowToPlay from "./HowToPlay";
import MuteToggle from "./MuteToggle";

/** The app's top chrome, shown only on Setup and Score — the two screens
 *  without their own full-bleed themed background. `sticky` (not `fixed`)
 *  so it reserves its own space in flow instead of needing matching
 *  padding-top, but stays pinned once content scrolls past it.
 *
 *  Colour is a fixed dark-ink strip: since <Game/> only mounts this on
 *  setup/score (never alongside a colour change), iOS 26 Safari's
 *  chrome-colour sampling picks it up on the ordinary mount/unmount that
 *  already happens when those screens come and go — no forced-remount `key`
 *  trick needed.
 *
 *  Deliberately no bottom counterpart: a bottom-edge bar would force Safari
 *  to mirror that element exactly (flat, opaque), replacing its native
 *  translucent/blurred toolbar. With no qualifying bottom-edge element,
 *  Safari falls back to sampling <body>'s own background — keeping its
 *  native glass/blur look, tinted by (and blurring) <body>'s own colour and
 *  polka-dot texture (globals.css). */
export default function TopBar() {
  return (
    <>
      {/* Opaque ink cap over the status-bar inset. The sticky header alone
          left iOS's standalone status bar fading from body tan to ink; a
          fixed full-width element flush with the top edge is what iOS
          samples for chrome colour. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)]"
        style={{ background: "var(--color-ink)" }}
      />
      <header
        // pt adds the top safe-area inset on top of the normal py-2 so the
        // icons/title clear the notch/Dynamic Island, while the dark-ink
        // background (now the first thing in flow, viewport-fit: "cover")
        // still extends all the way up to the physical top edge.
        className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)]"
        style={{ background: "var(--color-ink)" }}
      >
        <HowToPlay className="btn btn-cream flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink" />
        <h1
          className="font-display text-lg"
          style={{ color: "var(--color-cream)" }}
        >
          🦴 Ooga Tabooga
        </h1>
        <MuteToggle className="btn btn-cream flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink" />
      </header>
    </>
  );
}
