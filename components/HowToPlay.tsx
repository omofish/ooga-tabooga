"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Modal from "./Modal";
import { STEPS } from "./howto/steps";
import { TEAM_COLORS } from "@/lib/colors";
import { track } from "@/lib/analytics";

/** localStorage flag: the guide has been shown once (auto-open happens only
 *  before this is set). Own key, outside game state — no STATE_VERSION bump. */
const SEEN_KEY = "pfn-howto-seen-v1";

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
 *    a running game can't be wiped); otherwise it shows "Got It".
 *  - `autoOpen`: open once on mount if the guide has never been shown. */
export default function HowToPlay({
  className,
  onTry,
  autoOpen = false,
}: {
  className?: string;
  onTry?: () => void;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<"button" | "auto">("button");

  useEffect(() => {
    if (!autoOpen) return;
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // storage blocked: don't nag on every visit
    }
    if (!seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of client-only storage after mount
      setSource("auto");
      setOpen(true);
    }
  }, [autoOpen]);

  const show = () => {
    setSource("button");
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={show}
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
          source={source}
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
  source: "button" | "auto";
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
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
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
      <div
        className="flex h-[min(620px,calc(100svh-8rem))] min-h-0 touch-pan-y flex-col"
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
            timeline restarts from scratch. */}
        <div key={step} className="relative mt-3.5 flex min-h-0 flex-1 flex-col">
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

        <div className="mt-3.5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => go(step - 1)}
            aria-label="Back"
            className={`btn btn-cream px-4 py-3 ${step === 0 ? "invisible" : ""}`}
          >
            <span className="font-display text-lg">◀</span>
          </button>
          <div aria-hidden className="flex flex-1 justify-center gap-1.5">
            {STEPS.map((st, i) => (
              <span
                key={st.id}
                className={`h-[9px] rounded-full transition-all duration-300 ${i === step ? "w-[22px] bg-ink" : "w-[9px] bg-ink/20"}`}
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
