"use client";

import { colorForKey } from "@/lib/colors";
import { teamSummary } from "@/lib/game";
import type { ScreenProps } from "./types";
import Confetti from "./Confetti";

export default function GameOver({ state, dispatch }: ScreenProps) {
  const standings = state.teams
    .map((t) => ({ team: t, ...teamSummary(state, t.id) }))
    .sort((a, b) => b.total - a.total);

  const top = standings[0];
  const isTie =
    standings.length > 1 && standings[1].total === top.total;
  const winColor = colorForKey(top.team.colorKey);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden px-5 pb-6 pt-8">
      <Confetti />

      <header className="relative z-10 text-center">
        <div className="animate-wiggle text-5xl">🏆</div>
        {isTie ? (
          <h1 className="font-display text-shadow-pop text-3xl text-ink">
            It&apos;s a Tie!
          </h1>
        ) : (
          <>
            <p className="font-display text-lg text-ink-soft">Winner!</p>
            <h1
              className="animate-tada font-display text-shadow-pop text-4xl"
              style={{ color: winColor.deep }}
            >
              {winColor.mascot} {top.team.name}
            </h1>
            <p className="font-display text-2xl text-ink">{top.total} points</p>
          </>
        )}
      </header>

      {/* Standings */}
      <div className="relative z-10 mt-5 flex flex-1 flex-col gap-3 overflow-y-auto">
        {standings.map((s, i) => {
          const c = colorForKey(s.team.colorKey);
          return (
            <div
              key={s.team.id}
              className="chunk animate-rise rounded-2xl p-3"
              style={{ background: c.soft, animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{c.mascot}</span>
                <span className="font-display text-lg" style={{ color: c.deep }}>
                  {s.team.name}
                </span>
                {i === 0 && !isTie && <span className="text-lg">👑</span>}
                <span
                  className="font-display ml-auto text-2xl"
                  style={{ color: c.deep }}
                >
                  {s.total}
                </span>
              </div>
              {s.turns.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 border-t-2 border-ink/10 pt-2 text-xs font-bold text-ink-soft">
                  {s.turns.map((turn, ti) => (
                    <li key={ti}>
                      {turn.playerName}:{" "}
                      <span className="text-ink">{turn.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="relative z-10 mt-4 flex flex-col gap-3">
        <button
          onClick={() => dispatch({ type: "PLAY_AGAIN" })}
          className="btn btn-ink py-4 font-display text-xl"
        >
          Play Again — Same Tribes 🔁
        </button>
        <button
          onClick={() => dispatch({ type: "RETURN_TO_START" })}
          className="btn btn-cream py-3 font-display text-lg"
        >
          New Game 🏠
        </button>
      </div>
    </div>
  );
}
