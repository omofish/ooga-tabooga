"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Modal from "./Modal";
import { STEPS } from "./howto/steps";
import { TEAM_COLORS } from "@/lib/colors";
import { track } from "@/lib/analytics";

/** localStorage flag: the guide has been opened (or its first-visit banner
 *  dismissed) once. Own key, outside game state — no STATE_VERSION bump. */
const SEEN_KEY = "pfn-howto-seen-v1";
/** Window event fired when SEEN_KEY gets set, so an on-screen
 *  <HowToBanner/> hides even when the guide was opened from the "?" button. */
const SEEN_EVENT = "howto-seen";

type Source = "button" | "banner";

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
  window.dispatchEvent(new Event(SEEN_EVENT));
}

const [RED, BLUE] = TEAM_COLORS;
/** Team colours for the guide's art, fed to the .howto-* CSS in globals.css. */
const GUIDE_VARS = {
  "--h-red": RED.base,
  "--h-red-dark": RED.dark,
  "--h-red-soft": RED.soft,
  "--h-blue": BLUE.base,
  "--h-blue-dark": BLUE.dark,
  "--h-blue-soft": BLUE.soft,
} as CSSProperties;

/** Round "?" button that opens the step-by-step How-to-Play guide.
 *  Self-contained (manages its own open state) so screens can drop it in
 *  beside <MuteToggle />.
 *  - `onTry` set: the last step shows "Give It a Try" (setup screen only, so
 *    a running game can't be wiped); otherwise it shows "Got It". */
export default function HowToPlay({
  className,
  onTry,
}: {
  className?: string;
  onTry?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="How to play"
        className={
          className ??
          "btn btn-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        }
      >
        <span className="font-display text-2xl">?</span>
      </button>

      {open && (
        <Guide
          source="button"
          onTry={
            onTry &&
            (() => {
              setOpen(false);
              onTry();
            })
          }
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/** Quiet first-visit nudge (Setup, above Start Game) — the guide never opens
 *  by itself. Shows until the guide is opened (from here or "?") or ✕ is
 *  tapped; the parent decides eligibility (never played a card). */
export function HowToBanner({ onTry }: { onTry?: () => void }) {
  // Start hidden: storage is client-only, so read it after mount.
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // storage blocked: don't nag on every visit
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of client-only storage after mount
    if (!seen) setVisible(true);
    const hide = () => setVisible(false);
    window.addEventListener(SEEN_EVENT, hide);
    return () => window.removeEventListener(SEEN_EVENT, hide);
  }, []);

  return (
    <>
      {visible && (
        <div className="chunk animate-rise flex items-center rounded-2xl">
          <button
            onClick={() => setOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-3.5 text-left text-ink"
          >
            <span className="text-xl" aria-hidden>
              🦴
            </span>
            <span className="text-sm font-extrabold">
              First time? <span className="underline">How to play</span>
            </span>
            <span className="ml-auto font-display text-lg" aria-hidden>
              ›
            </span>
          </button>
          <button
            onClick={markSeen}
            aria-label="Hide how-to tip"
            className="shrink-0 px-3.5 py-2.5 text-lg font-extrabold text-ink-soft"
          >
            ✕
          </button>
        </div>
      )}

      {open && (
        <Guide
          source="banner"
          onTry={
            onTry &&
            (() => {
              setOpen(false);
              onTry();
            })
          }
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function Guide({
  source,
  onTry,
  onClose,
}: {
  source: Source;
  onTry?: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const furthest = useRef(0);
  const last = STEPS.length - 1;
  const s = STEPS[step];

  // Analytics: opened → each step viewed → completed (reached the end) →
  // closed (with how far they got), so drop-off per step is visible.
  useEffect(() => {
    markSeen();
    track("howto_opened", { source, canTry: !!onTry });
    return () => {
      track("howto_closed", {
        lastStep: STEPS[furthest.current].id,
        furthestStep: furthest.current + 1,
        completed: furthest.current === STEPS.length - 1,
      });
    };
    // Mount/unmount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    track("howto_step_viewed", { step: step + 1, stepId: STEPS[step].id });
    if (step > furthest.current) {
      furthest.current = step;
      if (step === STEPS.length - 1) track("howto_completed");
    }
  }, [step]);

  const go = (i: number) => setStep(Math.max(0, Math.min(last, i)));

  // Horizontal swipe changes step; vertical drags are left alone so the
  // chat panel can still scroll.
  const start = useRef<{ x: number; y: number } | null>(null);

  return (
    <Modal onClose={onClose} title="How to play">
      {/* Height = Modal's max-height (100svh − 5rem) minus its padding
          (3rem) and 4px+4px border (0.5rem), so the popup itself never
          scrolls unless the 480px floor kicks in on a very short phone. */}
      <div
        className="flex h-[max(480px,min(640px,calc(100svh-8.5rem)))] touch-pan-y flex-col"
        style={GUIDE_VARS}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const from = start.current;
          start.current = null;
          if (!from) return;
          const dx = e.clientX - from.x;
          const dy = e.clientY - from.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            go(step + (dx < 0 ? 1 : -1));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(step + 1);
          if (e.key === "ArrowLeft") go(step - 1);
        }}
      >
        <div className="pr-10">
          <div className="text-xs font-black uppercase tracking-[0.08em] text-ink-soft">
            Step {step + 1} of {STEPS.length} · {s.eyebrow}
          </div>
          <h2 className="mt-2 font-display text-[28px] leading-[1.05] text-ink [text-wrap:balance]">
            {s.title}
          </h2>
        </div>

        {/* key={step}: remount per step so every entrance animation and
            timeline restarts from scratch. The step area scrolls when its
            content is too tall; its inner padding (pulled back out with -mx)
            leaves room for check badges, bounces and the shaking button so
            the scroll box doesn't crop them. Big blocks enter with
            animate-rise, never a scale, for the same reason. */}
        <div key={step} className="relative -mx-2 mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 pb-1 pt-2.5">
          <s.Visual canTry={!!onTry} onTry={() => {
            track("howto_try_clicked");
            onTry?.();
          }} />
        </div>

        {s.caption && (
          <p className="mt-3 text-[14.5px] font-bold leading-[1.45] text-ink-soft [&_b]:font-black [&_b]:text-ink">
            {s.caption}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 pb-1.5">
          <button
            type="button"
            onClick={() => go(step - 1)}
            aria-label="Back"
            className={`btn btn-cream px-4 py-3 ${step === 0 ? "invisible" : ""}`}
          >
            <span className="font-display text-lg">◀</span>
          </button>
          <div aria-hidden className="flex min-w-0 flex-1 justify-center gap-1">
            {STEPS.map((st, i) => (
              <span
                key={st.id}
                className={`h-[7px] shrink-0 rounded-full transition-all duration-300 ${i === step ? "w-4 bg-ink" : "w-[7px] bg-ink/20"}`}
              />
            ))}
          </div>
          {step < last ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              className="btn btn-ink px-[18px] py-3"
            >
              <span className="whitespace-nowrap font-display text-lg">Next ▶</span>
            </button>
          ) : (
            !onTry && (
              <button type="button" onClick={onClose} className="btn btn-ink px-[18px] py-3">
                <span className="whitespace-nowrap font-display text-lg">Got It</span>
              </button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
