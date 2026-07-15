"use client";

import { useState, type ReactNode } from "react";
import Modal from "./Modal";

/** Round "?" button that opens the How-to-Play rules. Self-contained (manages
   its own open state) so screens can drop it in beside <MuteToggle />. */
export default function HowToPlay({ className }: { className?: string }) {
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
        <Modal onClose={() => setOpen(false)}>
          <div className="text-center">
            <div className="animate-wiggle text-5xl">🦴</div>
            <h2 className="mt-1 font-display text-3xl text-ink">How Play Game</h2>
          </div>

          {/* Rules scroll within a capped height so the card never overflows a
              small phone; the sticky Got-It button below stays reachable. */}
          <div className="mt-4 max-h-[58vh] space-y-5 overflow-y-auto pr-1">
            <p className="text-sm font-bold leading-relaxed text-ink-soft">
              One player hold phone, is chief. Chief grunt clues. Tribe guess
              word on the card. Bad talk get bonk. Tribe change when time end.
            </p>

            <Rule title="Talk way">
              Clue with one-syllable words only. “Big wet sky drop” — fine.
              “Rainstorm”? Two syllables — no good! And no say a word shown on
              card. No use hands, weird sounds. Is cheat.
            </Rule>

            <Rule title="When give bonk">
              Player from other tribe sit next to chief. Hold stick. If player
              talk no good, give bonk and pass word.
            </Rule>

            <div>
              <RuleTitle>Points</RuleTitle>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-3">
                  <Chip className="bg-ink text-cream">+1</Chip>
                  <span className="text-sm font-bold text-ink-soft">
                    first word
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Chip className="bg-amber-400 text-ink">+3</Chip>
                  <span className="text-sm font-bold text-ink-soft">
                    lots word
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Chip className="bg-ink/10 text-ink">−1</Chip>
                  <span className="text-sm font-bold text-ink-soft">if pass</span>
                </li>
              </ul>
            </div>

            <Rule title="How win">
              Tribes take turns, chief change each time. Most points wins. Ug
              good.
            </Rule>
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

function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <RuleTitle>{title}</RuleTitle>
      <p className="mt-1.5 text-sm font-bold leading-relaxed text-ink-soft">
        {children}
      </p>
    </div>
  );
}

function RuleTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-lg text-ink">{children}</h3>;
}

/** Point chip — same chunky look as the +1/+3 chips on the play cards. */
function Chip({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border-[3px] border-ink px-3 py-1 text-lg ${className ?? ""}`}
    >
      <span className="font-display">{children}</span>
    </span>
  );
}
