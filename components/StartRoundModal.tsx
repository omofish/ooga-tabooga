"use client";

import { useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { randomCaveName } from "@/lib/names";
import { unlockAudio } from "@/lib/sound";
import Modal from "./Modal";
import type { ScreenProps } from "./types";

export default function StartRoundModal({ state, dispatch }: ScreenProps) {
  const active = state.active;
  // A suggested caveman name shown as the greyed placeholder; if the chief
  // leaves the field blank we use this exact name, so it matches what they saw.
  const [suggested] = useState(randomCaveName);
  if (!active) return null;
  const team = state.teams.find((t) => t.id === active.teamId);
  if (!team) return null;
  const c = colorForKey(team.colorKey);

  const start = () => {
    // This tap is the user gesture that lets audio play for the whole turn
    // (countdown pips, ticks, buzzer), per the browser autoplay policy.
    unlockAudio();
    if (!active.playerName.trim()) {
      dispatch({ type: "SET_NAME", name: suggested });
    }
    dispatch({ type: "START_TURN" });
  };

  return (
    <Modal onClose={() => dispatch({ type: "CLOSE_MODAL" })} style={colorVars(c)}>
      <div className="text-center">
        <div className="animate-wiggle text-5xl">{team.emoji || c.mascot}</div>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
          Round {active.roundIndex + 1}
        </p>
        <h2 className="mt-3 font-display text-2xl" style={{ color: c.deep }}>
          {team.name}
        </h2>
      </div>

      <label className="mt-5 block text-sm font-extrabold text-ink-soft">
        What be your name?
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          value={active.playerName}
          onChange={(e) => dispatch({ type: "SET_NAME", name: e.target.value })}
          maxLength={16}
          placeholder={suggested}
          className="chunk w-full rounded-xl px-3 py-3 text-lg font-extrabold text-ink outline-none placeholder:font-extrabold placeholder:text-ink/35 focus:translate-y-[-1px]"
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
        onClick={start}
        className="btn btn-team mt-6 w-full py-4 text-xl"
      >
        <span className="font-display">Start Round ▶</span>
      </button>
    </Modal>
  );
}
