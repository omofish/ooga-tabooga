"use client";

import { colorForKey, colorVars } from "@/lib/colors";
import { randomCaveName } from "@/lib/names";
import type { ScreenProps } from "./types";

export default function StartRoundModal({ state, dispatch }: ScreenProps) {
  const active = state.active;
  if (!active) return null;
  const team = state.teams.find((t) => t.id === active.teamId);
  if (!team) return null;
  const c = colorForKey(team.colorKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={() => dispatch({ type: "CLOSE_MODAL" })}
        className="absolute inset-0 bg-ink/60"
      />

      <div
        className="chunk-lg animate-pop relative z-10 w-full max-w-sm rounded-3xl p-6"
        style={colorVars(c)}
      >
        <button
          onClick={() => dispatch({ type: "CLOSE_MODAL" })}
          aria-label="Close"
          className="btn btn-cream absolute -right-2 -top-2 h-9 w-9 rounded-full text-sm"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="animate-wiggle text-5xl">{c.mascot}</div>
          <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
            Round {active.roundIndex + 1}
          </p>
          <h2 className="font-display text-2xl" style={{ color: c.deep }}>
            {team.name}
          </h2>
        </div>

        <label className="mt-5 block text-sm font-extrabold text-ink-soft">
          Who be the poet?
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            value={active.playerName}
            onChange={(e) => dispatch({ type: "SET_NAME", name: e.target.value })}
            maxLength={16}
            placeholder="Caveman name"
            className="chunk w-full rounded-xl px-3 py-3 text-lg font-extrabold text-ink outline-none focus:translate-y-[-1px]"
            style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
          />
          <button
            onClick={() => dispatch({ type: "SET_NAME", name: randomCaveName() })}
            aria-label="Random name"
            className="btn btn-cream h-[52px] w-[52px] shrink-0 rounded-xl text-xl"
          >
            🎲
          </button>
        </div>

        <button
          onClick={() => dispatch({ type: "START_TURN" })}
          className="btn btn-team mt-6 w-full py-4 font-display text-xl"
        >
          Start Round ▶
        </button>
      </div>
    </div>
  );
}
