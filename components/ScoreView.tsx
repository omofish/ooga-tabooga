"use client";

import { useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { roundComplete, teamSummary } from "@/lib/game";
import { wordSetById } from "@/lib/words";
import Modal from "./Modal";
import RenameTeamModal from "./RenameTeamModal";
import type { ScreenProps } from "./types";

export default function ScoreView({ state, dispatch }: ScreenProps) {
  const { teams, rounds, currentRound } = state;
  const complete = roundComplete(state);
  const wordSet = wordSetById(state.wordSetId);
  const [quitOpen, setQuitOpen] = useState(false);
  const [renameTeamId, setRenameTeamId] = useState<string | null>(null);
  const renameTeam = teams.find((t) => t.id === renameTeamId);

  const cols = `minmax(2.2rem,auto) repeat(${teams.length}, minmax(0,1fr))`;

  return (
    <div className="flex flex-1 flex-col px-4 pb-6 pt-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl leading-none text-ink">
            Scoreboard
          </h1>
          <p className="text-xs font-bold text-ink-soft">
            {wordSet.emoji} {wordSet.name}
          </p>
        </div>
        <button
          onClick={() => setQuitOpen(true)}
          className="btn btn-cream px-3 py-2 text-xs"
        >
          Quit
        </button>
      </header>

      {quitOpen && (
        <Modal onClose={() => setQuitOpen(false)}>
          <div className="text-center">
            <div className="text-5xl">🚪</div>
            <h2 className="mt-1 font-display text-2xl text-ink">Quit game?</h2>
            <p className="mt-2 text-sm font-bold text-ink-soft">
              Scores will be lost and everyone heads back to the start.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setQuitOpen(false)}
              className="btn btn-cream py-3 font-display text-lg"
            >
              Keep Playing
            </button>
            <button
              onClick={() => dispatch({ type: "RETURN_TO_START" })}
              className="btn btn-ink py-3 font-display text-lg"
            >
              Quit
            </button>
          </div>
        </Modal>
      )}

      {renameTeam && (
        <RenameTeamModal
          team={renameTeam}
          dispatch={dispatch}
          onClose={() => setRenameTeamId(null)}
        />
      )}

      {/* Matrix */}
      <div className="chunk-lg overflow-hidden rounded-2xl">
        {/* Team header row */}
        <div className="grid items-stretch" style={{ gridTemplateColumns: cols }}>
          <div className="bg-ink/5" />
          {teams.map((t) => {
            const c = colorForKey(t.colorKey);
            return (
              <button
                key={t.id}
                onClick={() => setRenameTeamId(t.id)}
                aria-label={`Rename ${t.name}`}
                className="flex flex-col items-center gap-0.5 border-l-[3px] border-ink px-1 py-2 text-center active:translate-y-[1px]"
                style={{ background: c.base, color: c.onBase }}
              >
                <span className="text-2xl leading-none">{c.mascot}</span>
                <span className="text-[11px] font-extrabold leading-tight underline decoration-dotted underline-offset-2">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* One row per round */}
        {rounds.map((round, ri) => (
          <div
            key={ri}
            className="grid items-stretch border-t-[3px] border-ink"
            style={{ gridTemplateColumns: cols }}
          >
            <div className="flex items-center justify-center bg-ink/5 font-display text-sm text-ink-soft">
              {ri + 1}
            </div>
            {teams.map((t) => {
              const c = colorForKey(t.colorKey);
              const result = round[t.id];
              const isCurrent = ri === currentRound;
              return (
                <div
                  key={t.id}
                  className="flex min-h-[76px] items-center justify-center border-l-[3px] border-ink p-2"
                  style={
                    result
                      ? { ...colorVars(c), background: c.soft }
                      : undefined
                  }
                >
                  {result ? (
                    <div className="flex flex-col items-center leading-none">
                      <span
                        className="pts font-display text-2xl"
                        style={{ color: c.deep }}
                      >
                        {result.score}
                      </span>
                      <span className="mt-1 max-w-[6rem] truncate text-[10px] font-bold text-ink-soft">
                        {result.playerName}
                      </span>
                    </div>
                  ) : isCurrent ? (
                    // Shake to invite the tap; the wrapper animates so the
                    // button keeps its own press (:active) feedback.
                    <span className="animate-nudge inline-block">
                      <button
                        onClick={() =>
                          dispatch({ type: "OPEN_MODAL", teamId: t.id })
                        }
                        aria-label={`Play round ${ri + 1} for ${t.name}`}
                        className="btn flex h-12 w-12 items-center justify-center rounded-full text-xl"
                        style={{ ...colorVars(c), background: c.base, color: c.onBase }}
                      >
                        ▶
                      </button>
                    </span>
                  ) : (
                    <span className="text-ink-soft/40">—</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Totals */}
        <div
          className="grid items-stretch border-t-[3px] border-ink bg-ink"
          style={{ gridTemplateColumns: cols }}
        >
          <div className="flex items-center justify-center py-2 text-[10px] font-extrabold uppercase tracking-wide text-cream">
            Tot
          </div>
          {teams.map((t) => {
            const c = colorForKey(t.colorKey);
            const { total } = teamSummary(state, t.id);
            return (
              <div
                key={t.id}
                className="flex items-center justify-center border-l-[3px] border-cream/20 py-2"
              >
                <span className="pts font-display text-xl" style={{ color: c.base }}>
                  {total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer actions / hint */}
      <div className="mt-auto pt-6">
        {complete ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm font-bold text-ink-soft">
              Round {currentRound + 1} done! 🎉
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => dispatch({ type: "ADD_ROUND" })}
                className="btn btn-cream py-4 font-display text-lg"
              >
                Next Round ▶
              </button>
              <button
                onClick={() => dispatch({ type: "END_GAME" })}
                className="btn btn-ink py-4 font-display text-lg"
              >
                End Game 🏆
              </button>
            </div>
          </div>
        ) : (
          <p className="animate-pulse-soft text-center text-sm font-bold text-ink-soft">
            📲 Pass the phone — tap a tribe&apos;s ▶ to take a turn
          </p>
        )}
      </div>
    </div>
  );
}
