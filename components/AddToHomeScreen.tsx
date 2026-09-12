"use client";

import { useState } from "react";
import { isStandalone } from "@/lib/pwa";
import Modal from "./Modal";

/** Soft, easy-to-ignore nudge to install the PWA — sits below <ShareButton/>,
 *  plain underlined text rather than a button so it doesn't compete with
 *  Start Game / Share. Hidden entirely once already running standalone. */
export default function AddToHomeScreen() {
  const [open, setOpen] = useState(false);
  // Safe to read during render: SetupScreen only mounts after <Game/>'s
  // hydration gate, so there's no SSR mismatch (see SetupScreen.tsx).
  if (isStandalone()) return null;

  return (
    <>
      <p className="px-1 text-center text-xs font-bold text-ink-soft/60">
        Psst, want play game when no have net?{" "}
        <button
          onClick={() => setOpen(true)}
          className="underline decoration-dotted underline-offset-2"
        >
          Add to Home Screen
        </button>{" "}
        now!
      </p>

      {open && (
        <Modal onClose={() => setOpen(false)} title="Add to Home Screen">
          <div className="text-center">
            <div className="animate-wiggle text-5xl">🏠</div>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Add to Home Screen
            </h2>
          </div>

          <div className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto pr-4">
            <div>
              <h3 className="font-display text-lg text-ink">Why do it</h3>
              <ul className="mt-2 space-y-1.5 text-sm font-bold leading-relaxed text-ink-soft">
                <li>🏕️ Play with no net — good for weak signal, no wifi</li>
                <li>⚡ Opens fast from home screen, like real app</li>
                <li>🖼️ No browser bar — more room for game</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-lg text-ink">
                iPhone / iPad (Safari)
              </h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-bold leading-relaxed text-ink-soft">
                <li>Tap Share button (square, arrow up)</li>
                <li>Scroll down, tap &ldquo;Add to Home Screen&rdquo;</li>
                <li>Tap &ldquo;Add&rdquo;, top right</li>
              </ol>
            </div>

            <div>
              <h3 className="font-display text-lg text-ink">
                Android (Chrome)
              </h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-bold leading-relaxed text-ink-soft">
                <li>Tap ⋮ menu, top right</li>
                <li>Tap &ldquo;Add to Home screen&rdquo; or &ldquo;Install app&rdquo;</li>
                <li>Tap &ldquo;Add&rdquo; / &ldquo;Install&rdquo; to confirm</li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="btn btn-ink mt-6 w-full py-4 text-xl"
          >
            <span className="font-display">Got It</span>
          </button>
        </Modal>
      )}
    </>
  );
}
