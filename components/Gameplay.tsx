"use client";

import { useEffect, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { TURN_SECONDS } from "@/lib/game";
import type { ScreenProps } from "./types";

export default function Gameplay({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");

  const paused = active?.paused ?? false;
  const [now, setNow] = useState(() => Date.now());

  // Tick the clock while playing (and not paused).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [paused]);

  const remaining = paused
    ? active?.remainingWhilePaused ?? 0
    : Math.max(0, (active?.endsAt ?? 0) - now);

  // End the turn when the clock runs out.
  useEffect(() => {
    if (!paused && active && remaining <= 0) {
      dispatch({ type: "END_TURN" });
    }
  }, [paused, remaining, active, dispatch]);

  if (!active?.current) return null;

  const cur = active.current;
  const seconds = Math.ceil(remaining / 1000);
  const progress = Math.max(0, Math.min(1, remaining / (TURN_SECONDS * 1000)));
  const low = seconds <= 10;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col no-select"
      style={{ ...colorVars(c), background: c.base, color: c.onBase }}
    >
      {/* Top bar: timer + pause */}
      <header className="flex items-center gap-3 px-4 pt-5">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-3xl leading-none ${low ? "animate-pulse-soft" : ""}`}
            >
              {seconds}
            </span>
            <span className="text-xs font-bold opacity-80">sec left</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-black/20">
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-linear"
              style={{
                width: `${progress * 100}%`,
                background: low ? "#ffdd55" : "var(--team-on)",
              }}
            />
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: "PAUSE" })}
          aria-label="Pause"
          className="btn btn-cream h-11 w-11 shrink-0 rounded-full text-lg"
        >
          ⏸
        </button>
      </header>

      {/* Cards */}
      <main
        key={active.resolved.length}
        className="animate-swap flex flex-1 flex-col gap-3 p-4"
      >
        {/* +1 word / next-word */}
        {!cur.banked1 ? (
          <button
            onClick={() => dispatch({ type: "PLUS_ONE" })}
            className="chunk relative flex flex-1 flex-col items-center justify-center rounded-2xl px-4 text-center active:translate-y-[3px]"
          >
            <Badge className="bg-ink text-cream">+1</Badge>
            <span className="font-display text-4xl leading-tight text-ink">
              {cur.card.easy}
            </span>
            <span className="mt-2 text-xs font-bold text-ink-soft">
              tap when they guess it
            </span>
          </button>
        ) : (
          <div className="flex flex-1 flex-col gap-3">
            <div className="chunk relative flex items-center justify-center gap-2 rounded-2xl py-3">
              <span className="text-xl">✅</span>
              <span className="font-display text-xl text-ink">
                {cur.card.easy}
              </span>
              <span className="text-sm font-extrabold text-ink-soft">+1 in the bag</span>
            </div>
            <button
              onClick={() => dispatch({ type: "NEXT_WORD" })}
              className="btn btn-team flex flex-1 flex-col items-center justify-center rounded-2xl font-display text-2xl"
            >
              Next Word ▶
              <span className="mt-1 text-xs font-bold opacity-80">
                keep the +1, new card
              </span>
            </button>
          </div>
        )}

        {/* +3 phrase */}
        <button
          onClick={() => dispatch({ type: "PLUS_THREE" })}
          className="chunk relative flex flex-[1.25] flex-col items-center justify-center rounded-2xl px-4 text-center active:translate-y-[3px]"
          style={{ background: "#fffdf5" }}
        >
          <Badge className="bg-amber-400 text-ink">+3 ⭐</Badge>
          <span className="font-display text-3xl leading-tight text-ink">
            {cur.card.hard}
          </span>
          <span className="mt-2 text-xs font-bold text-ink-soft">
            {cur.banked1 ? "go for the big one!" : "tap for the bonus phrase"}
          </span>
        </button>
      </main>

      {/* Pass */}
      <footer className="p-4 pt-0">
        <button
          onClick={() => dispatch({ type: "PASS" })}
          className="btn btn-ink flex w-full items-center justify-center gap-2 py-4 font-display text-xl"
        >
          {cur.banked1 ? (
            <>Skip ▶</>
          ) : (
            <>
              Pass <span className="rounded-full bg-cream/20 px-2 text-base">−1</span>
            </>
          )}
        </button>
      </footer>

      {/* Pause overlay — hides the words */}
      {paused && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 p-8"
          style={{ background: c.base, color: c.onBase }}
        >
          <div className="animate-wiggle text-6xl">⏸️</div>
          <h2 className="font-display text-shadow-pop text-4xl">Paused</h2>
          <p className="text-center text-sm font-bold opacity-90">
            Words hidden. No peeking, {active.playerName}!
          </p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => dispatch({ type: "RESUME" })}
              className="btn btn-cream py-4 font-display text-xl"
            >
              ▶ Resume
            </button>
            <button
              onClick={() => dispatch({ type: "END_TURN" })}
              className="btn btn-ink py-3 font-display text-lg"
            >
              Give Up 🏳️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`absolute left-3 top-3 rounded-full border-2 border-ink px-2 py-0.5 font-display text-sm ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
