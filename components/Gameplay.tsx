"use client";

import { useEffect, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import * as sound from "@/lib/sound";
import type { ScreenProps } from "./types";

// Seconds-remaining marks that get a spoken announcement (when below the turn length).
const ANNOUNCE_AT = [90, 60, 30, 10];

export default function Gameplay({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");

  const paused = active?.paused ?? false;
  const [now, setNow] = useState(() => Date.now());
  const [timesUp, setTimesUp] = useState(false);

  // Tick the clock while playing (and not paused).
  useEffect(() => {
    if (paused || timesUp) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [paused, timesUp]);

  const remaining = paused
    ? active?.remainingWhilePaused ?? 0
    : Math.max(0, (active?.endsAt ?? 0) - now);
  const seconds = Math.ceil(remaining / 1000);

  // When the clock runs out, flash a quick "Time's Up!" splash…
  useEffect(() => {
    if (!paused && active && remaining <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimesUp(true);
    }
  }, [paused, remaining, active]);

  // …then sound the buzzer and end the turn (→ review) a beat later.
  useEffect(() => {
    if (!timesUp) return;
    sound.timeUp();
    sound.vibrate([90, 50, 90]);
    const id = setTimeout(() => dispatch({ type: "END_TURN" }), 1400);
    return () => clearTimeout(id);
  }, [timesUp, dispatch]);

  // Tick once every second (escalating through the final ten), and announce the
  // 90/60/30/10-second milestones. Depending on the whole-second value keeps it
  // to one tick per second even though the clock re-renders several times a
  // second. Milestones only fire when they're below the full turn length, so the
  // starting number isn't announced.
  useEffect(() => {
    if (paused || timesUp) return;
    if (seconds < 1) return;
    if (ANNOUNCE_AT.includes(seconds) && seconds < state.turnSeconds) {
      sound.announce(seconds);
    }
    sound.tick(seconds);
  }, [seconds, paused, timesUp, state.turnSeconds]);

  if (!active?.current) return null;

  const cur = active.current;
  const progress = Math.max(
    0,
    Math.min(1, remaining / (state.turnSeconds * 1000)),
  );
  const low = seconds <= 10;

  return (
    <div
      // Fixed to the viewport with no overflow and touch-action:none so the
      // screen can't scroll or pan — a small finger-drag while tapping a card
      // stays a tap instead of being stolen as a scroll gesture (misclick).
      className="relative flex flex-1 touch-none flex-col overflow-hidden no-select"
      style={{ ...colorVars(c), background: c.base, color: c.onBase }}
    >
      {/* Top bar: timer + pause */}
      <header className="flex items-center gap-3 px-4 pt-5">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-3xl ${low ? "animate-flash origin-left" : ""}`}
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
          className="btn btn-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <PauseIcon className="text-[19px]" />
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
            onClick={() => {
              sound.bank();
              sound.vibrate(15);
              dispatch({ type: "PLUS_ONE" });
            }}
            className="chunk relative flex min-h-0 flex-[1_1_0px] flex-col items-center justify-center rounded-2xl px-4 text-center active:translate-y-[3px]"
          >
            <span className="font-display text-4xl leading-tight text-ink">
              {cur.card.easy}
            </span>
            <PointChip label="+1" className="mt-4 bg-ink text-cream" />
          </button>
        ) : (
          <button
            onClick={() => dispatch({ type: "NEXT_WORD" })}
            className="btn btn-team flex min-h-0 flex-[1_1_0px] flex-col items-center justify-center gap-1.5 rounded-2xl px-4 text-center"
          >
            <span className="font-display text-3xl">Next Word ▶</span>
            <span className="text-xs font-bold opacity-80">
              ✅ “{cur.card.easy}” in the bag · +1
            </span>
          </button>
        )}

        {/* +3 phrase */}
        <button
          onClick={() => {
            sound.big();
            sound.vibrate([12, 30, 12]);
            dispatch({ type: "PLUS_THREE" });
          }}
          className="chunk relative flex min-h-0 flex-[1.25_1_0px] flex-col items-center justify-center rounded-2xl px-4 text-center active:translate-y-[3px]"
          style={{ background: "#fffdf5" }}
        >
          <span className="font-display text-3xl leading-tight text-ink">
            {cur.card.hard}
          </span>
          <PointChip label="+3" className="mt-4 bg-amber-400 text-ink" />
        </button>
      </main>

      {/* Pass */}
      <footer className="p-4 pt-0">
        <button
          onClick={() => {
            // A skip (already banked +1) carries no penalty — no buzzer.
            if (!cur.banked1) {
              sound.pass();
              sound.vibrate(35);
            }
            dispatch({ type: "PASS" });
          }}
          className="btn btn-ink flex h-14 w-full items-center justify-center gap-2 text-xl"
        >
          {cur.banked1 ? (
            <span className="font-display">Skip ▶</span>
          ) : (
            <>
              <span className="font-display">Pass</span>
              <span className="inline-flex items-center rounded-full bg-cream/20 px-2.5 py-1 text-base">
                <span className="font-display">−1</span>
              </span>
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
          <PauseIcon className="animate-wiggle text-7xl drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]" />
          <h2 className="font-display text-shadow-pop text-4xl">Paused</h2>
          <p className="text-center text-sm font-bold opacity-90">
            Words hidden. No peeking, {active.playerName}!
          </p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => dispatch({ type: "RESUME" })}
              className="btn btn-cream py-4 text-xl"
            >
              <span className="font-display">▶ Resume</span>
            </button>
            <button
              onClick={() => dispatch({ type: "RESTART_TURN" })}
              className="btn btn-cream py-3 text-lg"
            >
              <span className="font-display">Restart Round 🔄</span>
            </button>
            <button
              onClick={() => dispatch({ type: "END_TURN" })}
              className="btn btn-ink py-3 text-lg"
            >
              <span className="font-display">Give Up 🏳️</span>
            </button>
          </div>
        </div>
      )}

      {/* Time's-up splash — shown briefly before the round is scored */}
      {timesUp && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 p-8"
          style={{ background: c.base, color: c.onBase }}
        >
          <div className="animate-boom text-7xl">⏰</div>
          <h2 className="animate-boom font-display text-shadow-pop text-5xl">
            Time&apos;s Up!
          </h2>
        </div>
      )}
    </div>
  );
}

function PointChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border-[3px] border-ink px-5 py-2.5 text-3xl ${className ?? ""}`}
    >
      <span className="font-display">{label}</span>
    </span>
  );
}

/** Pause icon: two rounded bars, sized in `em` so `text-*` controls the scale
   and `currentColor` sets the fill. Gives clean spacing + centring the rotated
   font glyph couldn't. */
function PauseIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center gap-[0.24em] ${className ?? ""}`}
    >
      <span className="h-[1em] w-[0.3em] rounded-full bg-current" />
      <span className="h-[1em] w-[0.3em] rounded-full bg-current" />
    </span>
  );
}
