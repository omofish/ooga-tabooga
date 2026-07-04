"use client";

import { MAX_TEAMS } from "@/lib/game";
import { TEAM_COLORS } from "@/lib/colors";
import { WORD_SETS } from "@/lib/words";
import type { ScreenProps } from "./types";

const TEAM_OPTIONS = Array.from(
  { length: MAX_TEAMS - 1 },
  (_, i) => i + 2,
); // [2, 3]

export default function SetupScreen({ state, dispatch }: ScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-7 px-5 pb-10 pt-8">
      {/* Hero */}
      <header className="text-center">
        <div className="mb-1 text-6xl">🦴</div>
        <h1 className="font-display text-shadow-pop text-4xl leading-[1.05] text-ink">
          Poetry
          <span className="mt-1 block text-lg tracking-widest text-ink-soft">
            FOR
          </span>
          Neanderthals
        </h1>
        <p className="mt-3 text-sm font-bold text-ink-soft">
          Grunt one-syllable clues. Guess the words. Ug good.
        </p>
      </header>

      {/* Team count */}
      <section>
        <h2 className="font-display mb-2 text-xl text-ink">How many tribes?</h2>
        <div className="grid grid-cols-2 gap-3">
          {TEAM_OPTIONS.map((n) => {
            const selected = state.numTeams === n;
            return (
              <button
                key={n}
                onClick={() => dispatch({ type: "SET_NUM_TEAMS", n })}
                className={`btn ${selected ? "btn-ink" : "btn-cream"} flex flex-col items-center gap-1 py-4`}
              >
                <span className="font-display text-3xl">{n}</span>
                <span className="flex gap-1">
                  {TEAM_COLORS.slice(0, n).map((c) => (
                    <span
                      key={c.key}
                      className="h-3 w-3 rounded-full border-2 border-ink"
                      style={{ background: c.base }}
                    />
                  ))}
                </span>
                <span className="text-xs font-bold opacity-80">tribes</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {TEAM_COLORS.slice(0, state.numTeams).map((c) => (
            <span
              key={c.key}
              className="chunk flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold"
              style={{ background: c.base, color: c.onBase }}
            >
              <span>{c.mascot}</span>
              {c.teamName}
            </span>
          ))}
        </div>
      </section>

      {/* Word set */}
      <section>
        <h2 className="font-display mb-2 text-xl text-ink">Pick your words</h2>
        <div className="flex flex-col gap-3">
          {WORD_SETS.map((set) => {
            const selected = state.wordSetId === set.id;
            return (
              <button
                key={set.id}
                onClick={() => dispatch({ type: "SET_WORDSET", id: set.id })}
                className={`btn ${selected ? "btn-ink" : "btn-cream"} flex items-center gap-3 px-4 py-3 text-left`}
              >
                <span className="text-3xl">{set.emoji}</span>
                <span className="flex flex-col">
                  <span className="font-display text-lg leading-tight">
                    {set.name}
                  </span>
                  <span className="text-xs font-semibold opacity-80">
                    {set.blurb}
                  </span>
                </span>
                {selected && <span className="ml-auto text-xl">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={() => dispatch({ type: "START_GAME" })}
        className="btn btn-team mt-auto py-5 font-display text-2xl"
        style={{
          // Setup uses the first team's colour as a friendly accent.
          ["--team-base" as string]: TEAM_COLORS[0].base,
          ["--team-on" as string]: TEAM_COLORS[0].onBase,
        }}
      >
        Start Game 🔥
      </button>
    </div>
  );
}
