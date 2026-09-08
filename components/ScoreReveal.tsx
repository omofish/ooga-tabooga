"use client";

import { useEffect, useMemo, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { isSolo } from "@/lib/game";
import { bestTurn, recordBestTurn } from "@/lib/solo";
import * as sound from "@/lib/sound";
import type { ScreenProps } from "./types";
import Confetti from "./Confetti";

export default function ScoreReveal({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");
  const result = active ? state.rounds[active.roundIndex]?.[active.teamId] : undefined;
  const target = result?.score ?? 0;
  const solo = isSolo(state);

  // Read the pre-turn record ONCE so we can both show "Best: X" and detect a new
  // record before we overwrite it below.
  const [prevBest] = useState(() =>
    solo ? bestTurn(state.wordSetId, state.turnSeconds) : null,
  );
  const isNewBest = solo && target > 0 && (!prevBest || target > prevBest.score);

  // Persist a new solo record (side effect kept out of the pure reducer). Runs
  // once on reveal; `recordBestTurn` only writes when the score actually beats
  // the stored best, so a re-invoke (React strict mode) is harmless.
  useEffect(() => {
    if (solo && result) {
      recordBestTurn(state.wordSetId, state.turnSeconds, target, result.playerName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Sting to match the reveal: a happy arpeggio for a positive turn, else a sigh.
  useEffect(() => {
    sound.reveal(target > 0);
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
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6"
      style={{ ...colorVars(c), background: c.base, color: c.onBase }}
    >
      {celebrate && <Confetti />}

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="animate-wiggle text-5xl">{celebrate ? team?.emoji || c.mascot : "🦴"}</div>
        <p className="mt-2 font-display text-xl opacity-90">
          {result.playerName} · {team?.name}
        </p>

        <div className="animate-boom my-6 font-display no-text-trim text-shadow-pop text-[7rem] leading-[1.25]">
          {display}
        </div>
        <p className="font-display text-2xl">
          {celebrate ? "points! Ug good! 🎉" : "Ug… rough round."}
        </p>

        {solo && (
          <p className="mt-2 font-display text-lg opacity-95">
            {isNewBest
              ? prevBest
                ? `🏆 New best! Beat ${prevBest.score}`
                : "🏆 First record set!"
              : prevBest
                ? `Best: ${prevBest.score} · ${prevBest.name}`
                : ""}
          </p>
        )}

        <div className="mt-6 flex gap-2 text-sm font-extrabold">
          <Pill n={counts.hard} label="×3" />
          <Pill n={counts.easy} label="×1" />
          <Pill n={counts.pass} label="×−1" />
        </div>
      </div>

      <button
        onClick={() => dispatch({ type: "REVEAL_DONE" })}
        className="btn btn-cream relative z-10 mt-10 w-full max-w-xs py-4 text-xl"
      >
        <span className="font-display">Back to Board ▶</span>
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
