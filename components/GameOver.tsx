"use client";

import { useEffect } from "react";
import { colorForKey } from "@/lib/colors";
import { isSolo, teamSummary } from "@/lib/game";
import { bestTurn } from "@/lib/solo";
import { wordSetById } from "@/lib/word-sets";
import * as sound from "@/lib/sound";
import type { ScreenProps } from "./types";
import Confetti from "./Confetti";

export default function GameOver({ state, dispatch }: ScreenProps) {
  // Fanfare on arrival.
  useEffect(() => {
    sound.win();
  }, []);

  // Solo has no opponent to crown — summarise best turn vs the all-time record
  // instead of a standings podium.
  if (isSolo(state)) {
    return <SoloGameOver state={state} dispatch={dispatch} />;
  }

  const standings = state.teams
    .map((t) => ({ team: t, ...teamSummary(state, t.id) }))
    .sort((a, b) => b.total - a.total);

  const top = standings[0];
  const isTie =
    standings.length > 1 && standings[1].total === top.total;
  const winColor = colorForKey(top.team.colorKey);

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+2rem)]">
      <Confetti />

      {/* Stacked display-font lines need explicit gaps: text-box-trim strips
          each line's leading, so without spacing they collide (worse under the
          winner's `animate-tada` scale). */}
      <header className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="animate-wiggle text-5xl">🏆</div>
        {isTie ? (
          <h1 className="font-display text-shadow-pop text-3xl text-ink">
            It&apos;s a Tie!
          </h1>
        ) : (
          <>
            <p className="font-display text-lg text-ink-soft">Winner!</p>
            <h1
              className="animate-tada font-display text-shadow-pop py-1 text-4xl"
              style={{ color: winColor.deep }}
            >
              {top.team.emoji || winColor.mascot} {top.team.name}
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
                <span className="text-2xl">{s.team.emoji || c.mascot}</span>
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
          className="btn btn-ink py-4 text-xl"
        >
          <span className="font-display">Play Again — Same Tribes 🔁</span>
        </button>
        <button
          onClick={() => dispatch({ type: "RETURN_TO_START" })}
          className="btn btn-cream py-3 text-lg"
        >
          <span className="font-display">New Game 🏠</span>
        </button>
      </div>
    </div>
  );
}

/** Solo end screen: the headline is your best single turn this game, measured
 *  against the all-time record for this set + round length. */
function SoloGameOver({ state, dispatch }: ScreenProps) {
  const team = state.teams[0];
  const c = colorForKey(team?.colorKey ?? "red");
  const wordSet = wordSetById(state.wordSetId);
  const { total, turns } = team
    ? teamSummary(state, team.id)
    : { total: 0, turns: [] };
  const sessionBest = turns.reduce((m, t) => Math.max(m, t.score), 0);
  // The record already absorbed this game's turns (persisted on each reveal), so
  // if this game's best equals the all-time best, this game holds (or tied) it.
  const allTime = bestTurn(state.wordSetId, state.turnSeconds);
  const heldRecord = sessionBest > 0 && (!allTime || sessionBest >= allTime.score);

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+2rem)]">
      {heldRecord && <Confetti />}

      <header className="relative z-10 flex flex-col items-center gap-2 text-center">
        <div className="animate-wiggle text-5xl">{team?.emoji || c.mascot}</div>
        <p className="font-display text-lg text-ink-soft">
          {heldRecord ? "New Best! 🏆" : "Best Turn"}
        </p>
        <h1
          className="animate-tada font-display text-shadow-pop py-1 text-6xl"
          style={{ color: c.deep }}
        >
          {sessionBest}
        </h1>
        <p className="font-display text-lg text-ink">points in one turn</p>
      </header>

      <div className="relative z-10 mt-5 flex flex-col gap-3">
        <div
          className="chunk animate-rise rounded-2xl p-3 text-center"
          style={{ background: c.soft }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            All-time best · {wordSet.name} · {state.turnSeconds}s
          </p>
          <p className="mt-1 font-display text-2xl" style={{ color: c.deep }}>
            {allTime ? allTime.score : "—"}{" "}
            {allTime && (
              <span className="text-sm text-ink-soft">({allTime.name})</span>
            )}
          </p>
        </div>

        <div className="chunk animate-rise rounded-2xl p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            This game · {total} points over {turns.length} turn
            {turns.length === 1 ? "" : "s"}
          </p>
          {turns.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 border-t-2 border-ink/10 pt-2 text-xs font-bold text-ink-soft">
              {turns.map((turn, ti) => (
                <li key={ti}>
                  {turn.playerName}:{" "}
                  <span className="text-ink">{turn.score}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 mt-auto flex flex-col gap-3 pt-6">
        <button
          onClick={() => dispatch({ type: "PLAY_AGAIN" })}
          className="btn btn-ink py-4 text-xl"
        >
          <span className="font-display">Play Again 🔁</span>
        </button>
        <button
          onClick={() => dispatch({ type: "RETURN_TO_START" })}
          className="btn btn-cream py-3 text-lg"
        >
          <span className="font-display">New Game 🏠</span>
        </button>
      </div>
    </div>
  );
}
