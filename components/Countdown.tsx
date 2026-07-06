"use client";

import { useEffect, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import type { ScreenProps } from "./types";

export default function Countdown({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");

  // 3 -> 2 -> 1 -> 0 (GO!) -> start
  const [n, setN] = useState(3);

  useEffect(() => {
    if (n > 0) {
      const id = setTimeout(() => setN((v) => v - 1), 850);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => dispatch({ type: "COUNTDOWN_DONE" }), 650);
    return () => clearTimeout(id);
  }, [n, dispatch]);

  return (
    <div
      className="flex min-h-[100svh] flex-col items-center justify-center"
      style={{ ...colorVars(c), background: c.base, color: c.onBase }}
    >
      <p className="font-display text-xl opacity-90">
        {team?.emoji || c.mascot} {team?.name}
      </p>
      <div
        key={n}
        className="animate-boom font-display no-text-trim text-shadow-pop my-8 text-[9rem] leading-[1.25]"
      >
        {n === 0 ? "GO!" : n}
      </div>
      <p className="font-display text-lg opacity-80">Get ready to grunt…</p>
    </div>
  );
}
