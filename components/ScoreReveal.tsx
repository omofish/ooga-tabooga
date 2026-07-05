"use client";

import { useEffect, useMemo, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import type { ScreenProps } from "./types";
import Confetti from "./Confetti";

export default function ScoreReveal({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");
  const result = active ? state.rounds[active.roundIndex]?.[active.teamId] : undefined;
  const target = result?.score ?? 0;

  const [display, setDisplay] = useState(0);

  // Count up (or down) to the final score.
  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const counts = useMemo(() => {
    const cards = result?.cards ?? [];
    return {
      hard: cards.filter((x) => x.bucket === "hard").length,
      easy: cards.filter((x) => x.bucket === "easy").length,
      pass: cards.filter((x) => x.bucket === "pass").length,
    };
  }, [result]);

  if (!active || !result) return null;
  const celebrate = target > 0;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6"
      style={{ ...colorVars(c), background: c.base, color: c.onBase }}
    >
      {celebrate && <Confetti />}

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="animate-wiggle text-5xl">{celebrate ? c.mascot : "🦴"}</div>
        <p className="mt-2 font-display text-xl opacity-90">
          {result.playerName} · {team?.name}
        </p>

        <div className="animate-boom my-6 font-display text-shadow-pop text-[7rem] leading-[1.15]">
          {display}
        </div>
        <p className="font-display text-2xl">
          {celebrate ? "points! Ug good! 🎉" : "Ug… rough round."}
        </p>

        <div className="mt-6 flex gap-2 text-sm font-extrabold">
          <Pill n={counts.hard} label="×3" />
          <Pill n={counts.easy} label="×1" />
          <Pill n={counts.pass} label="×−1" />
        </div>
      </div>

      <button
        onClick={() => dispatch({ type: "REVEAL_DONE" })}
        className="btn btn-cream relative z-10 mt-10 w-full max-w-xs py-4 font-display text-xl"
      >
        Back to Board ▶
      </button>
    </div>
  );
}

function Pill({ n, label }: { n: number; label: string }) {
  return (
    <span className="rounded-full border-2 border-ink bg-cream/90 px-3 py-1 text-ink">
      {n} {label}
    </span>
  );
}
