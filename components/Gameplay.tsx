"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import * as sound from "@/lib/sound";
import type { ScreenProps } from "./types";
import MuteToggle from "./MuteToggle";

// Seconds-remaining marks that get a spoken announcement (when below the turn length).
const ANNOUNCE_AT = [90, 60, 30, 10];

const SPEED_CARD_MS = 10_000; // "Speed Round" mode: auto-skip after this long

// Chaos mode ("Everything Go Wrong"): only ONE disruption (poop, bats, or
// rocks) is ever up at a time, picked at random once the previous one is
// fully cleared. This is the random gap between a clear and the next spawn.
type Disruption = "poop" | "bats" | "rocks";
const DISRUPTION_GAP_MIN_MS = 10_000;
const DISRUPTION_GAP_MAX_MS = 15_000;

// Poop: cleared by swipe, same as before. Falls in from above and grows to
// full size on spawn (see .poop-fall-in in globals.css).
const BIRD_BOMB_WIPE_PX = 2160; // cumulative swipe distance to fully clear it
const BIRD_BOMB_MIN_SIZE = 340; // px
const BIRD_BOMB_MAX_SIZE = 650; // px

// Bats: cleared by holding the phone upside-down. Fly in from the right (see
// .bat-fly-in) and, once cleared, fly out to the left (.bat-fly-out).
const BAT_COUNT = 7; // ~half the original 14, to match the bigger size
const BAT_MIN_SIZE = 54; // px — biggest can be ~2x the smallest, ~2x old average
const BAT_MAX_SIZE = 108; // px
const BAT_FLIP_HOLD_MS = 300; // how long "upside-down" must be sustained
const BAT_FLIP_BETA_THRESHOLD = -45; // deviceorientation beta below this ~= upside-down
// Devices/browsers with no gyroscope (desktop) or that denied the iOS
// permission prompt would otherwise never fire deviceorientation at all,
// soft-locking the turn — auto-clear the swarm after this long regardless.
const BAT_ATTACK_SAFETY_MS = 12_000;
const BAT_FLY_OUT_MS = 400; // must match .bat-fly-out's CSS duration

// Rocks: cleared by shaking. Detection accumulates "shake energy" the same
// way poop accumulates swipe distance — harder/longer shaking clears it
// faster. Falls in from above (.rock-fall-in) and, once cleared, falls the
// rest of the way off the bottom of the screen (.rock-fall-out).
const ROCK_COUNT = 6; // ~half the original 12, to match the bigger size
const ROCK_MIN_SIZE = 82; // px — biggest can be ~2x the smallest, ~3x old average
const ROCK_MAX_SIZE = 164; // px
const ROCK_SHAKE_JERK_THRESHOLD = 12; // m/s² change between readings to count as "shaking"
const ROCK_SHAKE_ENERGY_TO_CLEAR = 90;
const ROCK_SLIDE_SAFETY_MS = 12_000; // same reasoning as BAT_ATTACK_SAFETY_MS
const ROCK_FALL_OUT_MS = 450; // must match .rock-fall-out's CSS duration

export default function Gameplay({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");
  const speedMode = state.challengeMode === "speed";
  const muteMode = state.challengeMode === "mute";
  const chaosMode = state.challengeMode === "chaos";

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

  // Chaos mode's sequencer: picks the next disruption once the current one
  // (if any) is fully cleared, after a random gap. Each disruption section
  // below just reacts to `currentDisruption` turning into (or out of) its
  // own id — none of them schedule their own spawns any more.
  const [currentDisruption, setCurrentDisruption] = useState<Disruption | null>(
    null,
  );

  useEffect(() => {
    if (!chaosMode || paused || timesUp || currentDisruption) return;
    const delay =
      DISRUPTION_GAP_MIN_MS +
      Math.random() * (DISRUPTION_GAP_MAX_MS - DISRUPTION_GAP_MIN_MS);
    const id = setTimeout(() => {
      const pool: Disruption[] = ["poop", "bats", "rocks"];
      setCurrentDisruption(pool[Math.floor(Math.random() * pool.length)]);
    }, delay);
    return () => clearTimeout(id);
  }, [chaosMode, paused, timesUp, currentDisruption]);

  // Poop: a single splat, cleared by swipe. `wipeDistance`/`dragStart` are
  // refs (not state) since pointermove fires far too often to re-render on;
  // only the derived opacity needs to be state. Falls in from above and
  // grows to full size on spawn (see .poop-fall-in in globals.css) — since
  // the element unmounts/remounts between spawns, that animation replays
  // every time without any extra key.
  const [splat, setSplat] = useState<{
    left: number;
    top: number;
    size: number;
    rotate: number;
    opacity: number;
  } | null>(null);
  const wipeDistance = useRef(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (currentDisruption !== "poop") {
      setSplat(null);
      return;
    }
    wipeDistance.current = 0;
    setSplat({
      left: 25 + Math.random() * 50, // % — center point, stays roughly mid-screen
      top: 38 + Math.random() * 17, // % — straddles the seam between the two cards
      size:
        BIRD_BOMB_MIN_SIZE + Math.random() * (BIRD_BOMB_MAX_SIZE - BIRD_BOMB_MIN_SIZE),
      rotate: -35 + Math.random() * 70,
      opacity: 1,
    });
  }, [currentDisruption]);

  const onSplatPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onSplatPointerMove = (e: React.PointerEvent) => {
    const last = dragStart.current;
    if (!last) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    wipeDistance.current += Math.hypot(e.clientX - last.x, e.clientY - last.y);
    const opacity = Math.max(0, 1 - wipeDistance.current / BIRD_BOMB_WIPE_PX);
    if (opacity <= 0) {
      sound.bank();
      sound.vibrate(20);
      dragStart.current = null;
      setSplat(null);
      setCurrentDisruption(null);
      return;
    }
    setSplat((s) => (s ? { ...s, opacity } : s));
  };

  const onSplatPointerEnd = () => {
    dragStart.current = null;
  };

  // Bats: cleared by holding the phone upside-down for BAT_FLIP_HOLD_MS
  // straight. "active" -> "leaving" (flying out, see .bat-fly-out) -> gone —
  // the leave animation needs to finish playing before the swarm actually
  // unmounts, so clearing isn't instant.
  const [batsPhase, setBatsPhase] = useState<"active" | "leaving" | null>(null);
  const flipStartedAt = useRef<number | null>(null);

  useEffect(() => {
    setBatsPhase(currentDisruption === "bats" ? "active" : null);
  }, [currentDisruption]);

  useEffect(() => {
    if (batsPhase !== "active") return;
    flipStartedAt.current = null;

    const onOrientation = (e: DeviceOrientationEvent) => {
      const isUpsideDown = e.beta !== null && e.beta < BAT_FLIP_BETA_THRESHOLD;
      if (!isUpsideDown) {
        flipStartedAt.current = null;
        return;
      }
      flipStartedAt.current ??= Date.now();
      if (Date.now() - flipStartedAt.current >= BAT_FLIP_HOLD_MS) {
        sound.bank();
        sound.vibrate([20, 30, 20]);
        setBatsPhase("leaving");
      }
    };
    window.addEventListener("deviceorientation", onOrientation);

    // Safety net for devices/browsers that never fire deviceorientation at
    // all (see BAT_ATTACK_SAFETY_MS above) — not a "flip", just a timeout.
    const safety = setTimeout(() => setBatsPhase("leaving"), BAT_ATTACK_SAFETY_MS);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      clearTimeout(safety);
    };
  }, [batsPhase]);

  useEffect(() => {
    if (batsPhase !== "leaving") return;
    const id = setTimeout(() => {
      setBatsPhase(null);
      setCurrentDisruption(null);
    }, BAT_FLY_OUT_MS);
    return () => clearTimeout(id);
  }, [batsPhase]);

  // Regenerated each time a swarm spawns; positions/sizes are fixed for that
  // swarm's whole lifetime (unaffected by the active->leaving transition),
  // only the CSS animations move them.
  const batsSpawned = batsPhase !== null;
  const bats = useMemo(
    () =>
      batsSpawned
        ? Array.from({ length: BAT_COUNT }, (_, i) => ({
            id: i,
            leftPct: 5 + Math.random() * 85,
            topPct: 8 + Math.random() * 77,
            size: BAT_MIN_SIZE + Math.random() * (BAT_MAX_SIZE - BAT_MIN_SIZE),
            enterDelay: Math.random() * 0.08,
            bobDuration: 0.9 + Math.random() * 0.4,
            bobOffset: Math.random() * 1.3,
          }))
        : [],
    [batsSpawned],
  );

  // Rocks: cleared by shaking. Same "active" -> "leaving" -> gone shape as
  // the bat swarm, swapping the orientation check for an accumulated
  // devicemotion "shake energy" — conceptually the same idea as poop's
  // cumulative swipe distance, just driven by the accelerometer.
  const [rocksPhase, setRocksPhase] = useState<"active" | "leaving" | null>(
    null,
  );
  const shakeEnergy = useRef(0);
  const lastAcceleration = useRef<number | null>(null);

  useEffect(() => {
    setRocksPhase(currentDisruption === "rocks" ? "active" : null);
  }, [currentDisruption]);

  useEffect(() => {
    if (rocksPhase !== "active") return;
    shakeEnergy.current = 0;
    lastAcceleration.current = null;

    const onMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity ?? e.acceleration;
      if (!acc) return;
      const magnitude =
        Math.abs(acc.x ?? 0) + Math.abs(acc.y ?? 0) + Math.abs(acc.z ?? 0);
      if (lastAcceleration.current !== null) {
        const jerk = Math.abs(magnitude - lastAcceleration.current);
        if (jerk > ROCK_SHAKE_JERK_THRESHOLD) {
          shakeEnergy.current += jerk;
          if (shakeEnergy.current >= ROCK_SHAKE_ENERGY_TO_CLEAR) {
            sound.bank();
            sound.vibrate([20, 30, 20]);
            setRocksPhase("leaving");
          }
        }
      }
      lastAcceleration.current = magnitude;
    };
    window.addEventListener("devicemotion", onMotion);

    // Same reasoning as the bats' safety timeout: a device/browser that
    // never fires devicemotion (desktop, denied permission) shouldn't be
    // able to soft-lock the turn.
    const safety = setTimeout(() => setRocksPhase("leaving"), ROCK_SLIDE_SAFETY_MS);

    return () => {
      window.removeEventListener("devicemotion", onMotion);
      clearTimeout(safety);
    };
  }, [rocksPhase]);

  useEffect(() => {
    if (rocksPhase !== "leaving") return;
    const id = setTimeout(() => {
      setRocksPhase(null);
      setCurrentDisruption(null);
    }, ROCK_FALL_OUT_MS);
    return () => clearTimeout(id);
  }, [rocksPhase]);

  const rocksSpawned = rocksPhase !== null;
  const rocks = useMemo(
    () =>
      rocksSpawned
        ? Array.from({ length: ROCK_COUNT }, (_, i) => ({
            id: i,
            leftPct: 5 + Math.random() * 85,
            topPct: 8 + Math.random() * 77,
            size: ROCK_MIN_SIZE + Math.random() * (ROCK_MAX_SIZE - ROCK_MIN_SIZE),
            enterDelay: Math.random() * 0.1,
            tremble: 0.5 + Math.random() * 0.3,
          }))
        : [],
    [rocksSpawned],
  );

  // Only one disruption is ever up, so the banner just names it directly —
  // and disappears the instant the gesture succeeds, even while the visual
  // (bats/rocks) is still animating off screen.
  const disruptionMessage =
    currentDisruption === "poop" && splat
      ? "WIPE THE POOP"
      : batsPhase === "active"
        ? "FLIP YOUR PHONE"
        : rocksPhase === "active"
          ? "SHAKE YOUR PHONE"
          : null;

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

      {/* Poop splat — a huge emoji blocking part of the screen, falling in
          and growing to full size on spawn (see .poop-fall-in), cleared by
          swiping it away. No click handler (swiping over the cards
          underneath must never register as a tap on them), just
          pointer-move tracking. Only one up at a time under chaos mode. The
          how-to instruction lives in the shared pulsing banner below. */}
      {splat && (
        <div
          role="button"
          aria-label="Poop splat — swipe to wipe it away"
          onPointerDown={onSplatPointerDown}
          onPointerMove={onSplatPointerMove}
          onPointerUp={onSplatPointerEnd}
          onPointerCancel={onSplatPointerEnd}
          className="poop-fall-in absolute z-10 touch-none select-none"
          style={{
            left: `${splat.left}%`,
            top: `${splat.top}%`,
            transform: "translate(-50%, -50%)",
            opacity: splat.opacity,
          }}
        >
          <span
            className="block leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]"
            style={{ fontSize: splat.size, transform: `rotate(${splat.rotate}deg)` }}
          >
            💩
          </span>
        </div>
      )}

      {/* Bats: a swarm flies in from the right (see .bat-fly-in), bobs in
          place (see .bat-bob) until the phone is flipped upside-down, then
          flies out to the left (.bat-fly-out). Purely visual — cleared by
          orientation, not touch — so no pointer handlers. */}
      {batsPhase && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {bats.map((bat) => (
            <div
              key={bat.id}
              className={batsPhase === "leaving" ? "bat-fly-out absolute" : "bat-fly-in absolute"}
              style={{
                left: `${bat.leftPct}%`,
                top: `${bat.topPct}%`,
                animationDelay: batsPhase === "leaving" ? "0s" : `${bat.enterDelay}s`,
              }}
            >
              <span
                className="bat-bob"
                style={{
                  fontSize: bat.size,
                  animationDelay: `-${bat.bobOffset}s`,
                  animationDuration: `${bat.bobDuration}s`,
                }}
              >
                🦇
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rocks: fall in from above (see .rock-fall-in) then tremble in place
          (see .rock-tremble, a "shake me" hint) until shaken off, then fall
          the rest of the way off the bottom of the screen (.rock-fall-out).
          Purely visual — cleared by the accelerometer, not touch — so no
          pointer handlers. */}
      {rocksPhase && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {rocks.map((rock) => (
            <div
              key={rock.id}
              className={rocksPhase === "leaving" ? "rock-fall-out absolute" : "rock-fall-in absolute"}
              style={{
                left: `${rock.leftPct}%`,
                top: `${rock.topPct}%`,
                animationDelay: rocksPhase === "leaving" ? "0s" : `${rock.enterDelay}s`,
              }}
            >
              <span
                className="rock-tremble"
                style={{ fontSize: rock.size, animationDuration: `${rock.tremble}s` }}
              >
                🪨
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Shared "how to clear this" banner for whichever disruption is
          currently up — reused as-is by any future one too. Sits above the
          splats/bats (z-10) but below Pause/Time's-up (z-20/30) so it's
          naturally hidden by either without extra conditions. */}
      {disruptionMessage && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+5.25rem)] z-[15] flex justify-center px-6">
          <div className="chunk animate-pulse-soft rounded-full px-5 py-3 text-center">
            <span className="font-display text-[28px] text-ink">
              {disruptionMessage}
            </span>
          </div>
        </div>
      )}

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
