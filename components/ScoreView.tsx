"use client";

import { useState } from "react";
import { toast } from "sonner";
import { colorForKey, colorVars } from "@/lib/colors";
import {
  anyTurnsPlayed,
  isSolo,
  nextUpTeamId,
  roundsBalanced,
  teamSummary,
} from "@/lib/game";
import { bestTurn } from "@/lib/solo";
import { wordSetById } from "@/lib/word-sets";
import Modal from "./Modal";
import RenameTeamModal from "./RenameTeamModal";
import type { ScreenProps } from "./types";

export default function ScoreView({ state, dispatch }: ScreenProps) {
  const { teams, rounds } = state;
  const wordSet = wordSetById(state.wordSetId);
  const solo = isSolo(state);
  const best = solo ? bestTurn(state.wordSetId, state.turnSeconds) : null;
  const [quitOpen, setQuitOpen] = useState(false);
  const [endGameOpen, setEndGameOpen] = useState(false);
  const [renameTeamId, setRenameTeamId] = useState<string | null>(null);
  const renameTeam = teams.find((t) => t.id === renameTeamId);
  const nextTeam = teams.find((t) => t.id === nextUpTeamId(state));
  const nextColor = nextTeam ? colorForKey(nextTeam.colorKey) : null;
  const played = anyTurnsPlayed(state);
  const canEndGame = played && roundsBalanced(state);

  const tryEndGame = () => {
    if (!played) {
      toast("No can end game yet — no round played!");
      return;
    }
    if (!canEndGame) {
      toast("No can end game yet — round not done!");
      return;
    }
    setEndGameOpen(true);
  };

  const cols = `minmax(2.2rem,auto) repeat(${teams.length}, minmax(0,1fr))`;

  return (
    // No background of its own — deliberately left transparent so <body>'s
    // own colour + polka-dot texture (globals.css) shows through, matching
    // SetupScreen.
    <div className="flex flex-1 flex-col px-4 pb-6 pt-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">
            Scoreboard
          </h1>
          <p className="mt-1.5 text-xs font-bold text-ink-soft">
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
        <Modal onClose={() => setQuitOpen(false)} title="Quit game">
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
              className="btn btn-cream py-3 text-lg"
            >
              <span className="font-display">Keep Playing</span>
            </button>
            <button
              onClick={() => dispatch({ type: "RETURN_TO_START" })}
              className="btn btn-ink py-3 text-lg"
            >
              <span className="font-display">Quit</span>
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

      {/* Solo: the record you're chasing, for this set + round length. */}
      {solo && (
        <div className="chunk mb-4 rounded-xl px-3 py-2 text-center text-xs font-bold text-ink">
          🏆 Best turn · {wordSet.name} · {state.turnSeconds}s:{" "}
          <span className="font-display text-sm">
            {best ? `${best.score} (${best.name})` : "—"}
          </span>
        </div>
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
                <span className="text-2xl leading-none">{t.emoji || c.mascot}</span>
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
            <div className="flex items-center justify-center bg-ink/5 text-sm text-ink-soft">
              <span className="font-display">{ri + 1}</span>
            </div>
            {teams.map((t) => {
              const c = colorForKey(t.colorKey);
              const result = round[t.id];
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
                        className="font-display text-2xl"
                        style={{ color: c.deep }}
                      >
                        {result.score}
                      </span>
                      <span className="mt-1 max-w-[6rem] truncate text-[10px] font-bold text-ink-soft">
                        {result.playerName}
                      </span>
                    </div>
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
                className="flex items-center justify-center py-2"
              >
                <span className="font-display text-xl" style={{ color: c.base }}>
                  {total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer actions / hint */}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        {nextTeam && nextColor && (
          <>
            <p className="animate-pulse-soft text-center text-sm font-bold text-ink-soft">
              {solo
                ? "🏆 Tap play to take a turn — beat your best!"
                : `📲 Pass the phone — ${nextTeam.name} is up`}
            </p>
            <button
              onClick={() =>
                dispatch({ type: "OPEN_MODAL", teamId: nextTeam.id })
              }
              className="btn w-full py-4 text-xl"
              style={{
                ...colorVars(nextColor),
                background: nextColor.base,
                color: nextColor.onBase,
              }}
            >
              <span className="font-display">
                {nextTeam.emoji || nextColor.mascot} Play ▶
              </span>
            </button>
          </>
        )}

        <button
          onClick={tryEndGame}
          aria-disabled={!canEndGame}
          className={`btn btn-ink w-full py-4 text-lg ${canEndGame ? "" : "opacity-45"}`}
        >
          <span className="font-display">End Game 🏆</span>
        </button>
      </div>

      {endGameOpen && (
        <Modal onClose={() => setEndGameOpen(false)} title="End game">
          <div className="text-center">
            <div className="text-5xl">🏆</div>
            <h2 className="mt-1 font-display text-2xl text-ink">
              End the game?
            </h2>
            <p className="mt-2 text-sm font-bold text-ink-soft">
              Scores lock in and everyone heads to the final standings.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setEndGameOpen(false)}
              className="btn btn-cream py-3 text-lg"
            >
              <span className="font-display">Keep Playing</span>
            </button>
            <button
              onClick={() => dispatch({ type: "END_GAME" })}
              className="btn btn-ink py-3 text-lg"
            >
              <span className="font-display">End Game</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
