"use client";

import { useEffect, useRef, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import * as sound from "@/lib/sound";
import type { ScreenProps } from "./types";
import MuteToggle from "./MuteToggle";

// Seconds-remaining marks that get a spoken announcement (when below the turn length).
const ANNOUNCE_AT = [90, 60, 30, 10];

const SPEED_CARD_MS = 10_000; // "Speed Round" mode: auto-skip after this long
// "Bird Bomb" mode: gap before another splat can spawn (~30% more often than
// the original 5-11s range, i.e. divided by 1.3).
const BIRD_BOMB_MIN_MS = 3_850;
const BIRD_BOMB_MAX_MS = 8_460;
const BIRD_BOMB_WIPE_PX = 720; // cumulative swipe distance to fully clear one (1.5x)
const BIRD_BOMB_MIN_SIZE = 340; // px — ~2x the original 170-260 range
const BIRD_BOMB_MAX_SIZE = 650; // px — ~2.5x
const BIRD_BOMB_MAX_CONCURRENT = 3;

export default function Gameplay({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");
  const speedMode = state.challengeMode === "speed";
  const muteMode = state.challengeMode === "mute";
  const birdBombMode = state.challengeMode === "birdbomb";

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

  // "Speed Round" mode: each card gets its own 10s clock, reset whenever a new
  // card is dealt or the turn resumes from pause (so unpausing never triggers
  // an instant skip). `firedRef` guards against double-dispatching PASS for
  // the same card across the effect's rapid re-runs as `now` ticks.
  const cardIndex = active?.resolved.length ?? 0;
  const [cardEndsAt, setCardEndsAt] = useState<number | null>(null);
  const firedForCard = useRef(-1);

  useEffect(() => {
    if (!speedMode || paused) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCardEndsAt(Date.now() + SPEED_CARD_MS);
  }, [speedMode, paused, cardIndex]);

  useEffect(() => {
    if (!speedMode || paused || timesUp || !cardEndsAt) return;
    if (now < cardEndsAt || firedForCard.current === cardIndex) return;
    firedForCard.current = cardIndex;
    if (!active?.current?.banked1) {
      sound.pass();
      sound.vibrate(35);
    }
    dispatch({ type: "PASS" });
  }, [now, speedMode, paused, timesUp, cardEndsAt, cardIndex, active, dispatch]);

  // Whole seconds for the label, but the *bar* tracks the raw ms remaining
  // (cardRemainingMs) so it drains smoothly instead of stepping once a second.
  const cardRemainingMs =
    speedMode && cardEndsAt ? Math.max(0, cardEndsAt - now) : 0;
  const cardSecondsLeft =
    speedMode && cardEndsAt ? Math.ceil(cardRemainingMs / 1000) : null;

  // "Bird Bomb" mode: huge splats block part of the screen — each positioned
  // to straddle the seam between the two cards, since that's what they're
  // meant to obstruct — until wiped away by a swipe. Several can be on
  // screen at once (capped at BIRD_BOMB_MAX_CONCURRENT); this effect keeps
  // scheduling another independent spawn any time there's room for one, so
  // clearing one doesn't wait on the others. `wipeDistances`/`dragPositions`
  // are keyed-by-id refs (not state) since pointermove fires far too often
  // to re-render on; only the derived opacity needs to be state.
  const [splats, setSplats] = useState<
    { id: number; left: number; top: number; size: number; rotate: number; opacity: number }[]
  >([]);
  const nextSplatId = useRef(0);
  const wipeDistances = useRef(new Map<number, number>());
  const dragPositions = useRef(new Map<number, { x: number; y: number }>());

  useEffect(() => {
    if (!birdBombMode || paused || timesUp) return;
    if (splats.length >= BIRD_BOMB_MAX_CONCURRENT) return;
    const delay =
      BIRD_BOMB_MIN_MS + Math.random() * (BIRD_BOMB_MAX_MS - BIRD_BOMB_MIN_MS);
    const id = setTimeout(() => {
      const splatId = nextSplatId.current++;
      wipeDistances.current.set(splatId, 0);
      setSplats((prev) =>
        prev.length >= BIRD_BOMB_MAX_CONCURRENT
          ? prev
          : [
              ...prev,
              {
                id: splatId,
                left: 25 + Math.random() * 50, // % — center point, stays roughly mid-screen
                top: 38 + Math.random() * 17, // % — straddles the seam between the two cards
                size:
                  BIRD_BOMB_MIN_SIZE +
                  Math.random() * (BIRD_BOMB_MAX_SIZE - BIRD_BOMB_MIN_SIZE),
                rotate: -35 + Math.random() * 70,
                opacity: 1,
              },
            ],
      );
    }, delay);
    return () => clearTimeout(id);
  }, [birdBombMode, paused, timesUp, splats.length]);

  const clearSplat = (id: number) => {
    sound.bank();
    sound.vibrate(20);
    dragPositions.current.delete(id);
    wipeDistances.current.delete(id);
    setSplats((prev) => prev.filter((s) => s.id !== id));
  };

  const onSplatPointerDown = (id: number) => (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragPositions.current.set(id, { x: e.clientX, y: e.clientY });
  };

  const onSplatPointerMove = (id: number) => (e: React.PointerEvent) => {
    const last = dragPositions.current.get(id);
    if (!last) return;
    dragPositions.current.set(id, { x: e.clientX, y: e.clientY });
    const total =
      (wipeDistances.current.get(id) ?? 0) +
      Math.hypot(e.clientX - last.x, e.clientY - last.y);
    wipeDistances.current.set(id, total);
    const opacity = Math.max(0, 1 - total / BIRD_BOMB_WIPE_PX);
    if (opacity <= 0) {
      clearSplat(id);
      return;
    }
    setSplats((prev) => prev.map((s) => (s.id === id ? { ...s, opacity } : s)));
  };

  const onSplatPointerEnd = (id: number) => () => {
    dragPositions.current.delete(id);
  };

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
      className="relative flex h-[100svh] touch-none flex-col overflow-hidden no-select"
      style={{ ...colorVars(c), background: c.base, color: c.onBase }}
    >
      {/* Top bar: timer + pause */}
      <header className="flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
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
        <MuteToggle className="btn btn-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink" />
        <button
          onClick={() => dispatch({ type: "PAUSE" })}
          aria-label="Pause"
          className="btn btn-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        >
          <PauseIcon className="text-[19px]" />
        </button>
      </header>

      {muteMode && (
        <div className="mx-4 mt-2 rounded-xl border-2 border-ink bg-cream/90 px-3 py-1.5 text-center text-xs font-extrabold text-ink">
          🤐 Mute Mode — gestures only, no words!
        </div>
      )}

      {/* Cards */}
      <main
        key={active.resolved.length}
        className="animate-swap flex flex-1 flex-col gap-3 p-4"
      >
        {/* Speed Round: this card's own 10s clock, spanning the card width.
            The fill tracks raw ms (cardRemainingMs) rather than the whole-
            second label so it drains smoothly; colour steps green -> yellow
            at 7s -> red + soft flash at 3s. */}
        {cardSecondsLeft !== null && (
          <div
            className={`relative h-8 shrink-0 overflow-hidden rounded-full border-[3px] border-ink bg-black/20 ${cardSecondsLeft <= 3 ? "animate-flash-soft" : ""}`}
          >
            <div
              className="absolute inset-y-0 left-0 transition-[width,background-color] duration-200 ease-linear"
              style={{
                width: `${(cardRemainingMs / SPEED_CARD_MS) * 100}%`,
                background:
                  cardSecondsLeft <= 3
                    ? "#ff6a5c"
                    : cardSecondsLeft <= 7
                      ? "#ffdd55"
                      : "#3da95b",
              }}
            />
            <div className="relative flex h-full items-center justify-center">
              <span className="font-display text-shadow-pop text-sm text-cream">
                ⏱️ {cardSecondsLeft}s
              </span>
            </div>
          </div>
        )}

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
            className="btn btn-ink flex min-h-0 flex-[1_1_0px] flex-col items-center justify-center gap-1.5 rounded-2xl px-4 text-center"
          >
            <span className="font-display text-3xl">Next Word ▶</span>
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
      <footer className="px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
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
            <span className="font-display">Next ▶</span>
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

      {/* Bird Bomb splats — huge emoji blocking part of the screen until
          swiped away. No click handler (swiping over the cards underneath
          must never register as a tap on them), just pointer-move tracking.
          Several can be up at once. */}
      {birdBombMode &&
        splats.map((splat) => (
          <div
            key={splat.id}
            role="button"
            aria-label="Bird bomb — swipe to wipe it away"
            onPointerDown={onSplatPointerDown(splat.id)}
            onPointerMove={onSplatPointerMove(splat.id)}
            onPointerUp={onSplatPointerEnd(splat.id)}
            onPointerCancel={onSplatPointerEnd(splat.id)}
            className="absolute z-10 flex touch-none select-none flex-col items-center"
            style={{
              left: `${splat.left}%`,
              top: `${splat.top}%`,
              transform: "translate(-50%, -50%)",
              opacity: splat.opacity,
            }}
          >
            <span
              className="leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]"
              style={{ fontSize: splat.size, transform: `rotate(${splat.rotate}deg)` }}
            >
              💩
            </span>
            <span className="font-display text-shadow-pop -mt-2 text-sm text-cream">
              Swipe to wipe!
            </span>
          </div>
        ))}

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
