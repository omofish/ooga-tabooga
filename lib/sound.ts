// A tiny WebAudio sound engine for the game.
//
// Every tone is *synthesised* at runtime with an OscillatorNode — there are no
// audio files, so the offline PWA needs no extra cached assets. Playback is a
// no-op until the audio context has been unlocked by a user gesture (browser
// autoplay policy) and whenever the player has muted.
//
// A single "muted" flag gates both sound *and* haptics, persisted in
// localStorage under its own key so it never touches the game-state shape (no
// STATE_VERSION bump). Sounds are pure side effects fired from component event
// handlers, so the game reducer stays pure.

import { useSyncExternalStore } from "react";

const MUTE_KEY = "pfn-muted";

let ctx: AudioContext | null = null;
let muted = false;
let speechPrimed = false;

// Restore the persisted mute preference on the client (guarded for SSR).
if (typeof window !== "undefined") {
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    // ignore private-mode / access errors
  }
}

// ---- Mute state (observable) ---------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  if (next === muted) return;
  muted = next;
  try {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    // ignore quota / private-mode errors
  }
  for (const l of listeners) l();
}

export function toggleMuted(): void {
  setMuted(!muted);
}

function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** React hook that re-renders when the mute preference changes. */
export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, isMuted, () => false);
}

// ---- Audio context -------------------------------------------------------

/**
 * Lazily create (or resume) the shared AudioContext. Must be called from within
 * a user gesture the first time, per browser autoplay policy. Safe to call
 * repeatedly — e.g. on every "Start Round" tap and on the mute toggle.
 *
 * Also primes speech synthesis (see `primeSpeech`) so the timer-driven
 * `announce()` calls later in the turn aren't blocked by the same policy.
 */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  try {
    if (!ctx) {
      const w = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // WebAudio unavailable — degrade silently to no sound.
  }
  primeSpeech();
}

/**
 * Warm up the Web Speech engine from within a user gesture. Browsers (notably
 * iOS Safari) drop `speechSynthesis.speak()` unless speech was first invoked
 * during a gesture, and our announcements fire from a timer — so we speak one
 * silent utterance here to satisfy that requirement. `resume()` runs every time
 * (the engine can re-suspend); the silent utterance only needs to run once.
 */
function primeSpeech(): void {
  if (typeof window === "undefined") return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.resume();
    if (speechPrimed) return;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    synth.speak(u);
    speechPrimed = true;
  } catch {
    // No speech synthesis — announcements fall back to their chime.
  }
}

// ---- Tone helper ---------------------------------------------------------

type ToneOpts = {
  freq: number;
  duration: number; // seconds
  type?: OscillatorType;
  gain?: number; // peak gain, 0..1
  attack?: number; // ramp-up time, seconds
  startAt?: number; // delay from "now", seconds
  slideTo?: number; // optional target frequency for a glide
};

/** Play a single enveloped oscillator note. No-op if audio isn't ready. */
function tone({
  freq,
  duration,
  type = "sine",
  gain = 0.18,
  attack = 0.005,
  startAt = 0,
  slideTo,
}: ToneOpts): void {
  if (!ctx) return;
  const t0 = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration);
  }
  // Fade in fast, then exponentially decay to (near) silence — avoids clicks.
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Fire a vibration pattern if supported. Gated by the same mute flag. */
export function vibrate(pattern: number | number[]): void {
  if (muted || typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore
  }
}

// ---- Semantic game sounds ------------------------------------------------

/** Soft, short UI click for any button press, app-wide. */
export function click(): void {
  if (muted) return;
  tone({ freq: 520, duration: 0.025, type: "triangle", gain: 0.07, slideTo: 380 });
}

/** +1 word banked: a quick bright blip. */
export function bank(): void {
  if (muted) return;
  tone({ freq: 620, duration: 0.1, type: "triangle", gain: 0.16, slideTo: 880 });
}

/** +3 phrase nailed: a punchy two-note rise. */
export function big(): void {
  if (muted) return;
  tone({ freq: 523, duration: 0.12, type: "square", gain: 0.13 });
  tone({ freq: 784, duration: 0.18, type: "square", gain: 0.14, startAt: 0.1 });
}

/** Pass / skip with penalty: a short descending "womp". */
export function pass(): void {
  if (muted) return;
  tone({ freq: 300, duration: 0.22, type: "sawtooth", gain: 0.13, slideTo: 150 });
}

/**
 * Clock tick, called once per second with the seconds remaining. Above ten it's
 * a calm, quiet tick; through the final ten it both escalates — rising in pitch
 * and volume as the number falls — and switches to double time, adding an
 * off-beat tick half a second later so the pulse runs twice as fast.
 */
export function tick(secondsLeft: number): void {
  if (muted) return;

  // Plenty of time left: a soft, low, ambient tick.
  if (secondsLeft > 10) {
    tone({ freq: 900, duration: 0.03, type: "square", gain: 0.05 });
    return;
  }

  // Final ten: urgency climbs from ~0.1 (at 10s) to 1.0 (at 1s)…
  const urgency = (11 - secondsLeft) / 10;
  const freq = 1050 + urgency * 900; // ~1140 → 1950 Hz
  const gain = 0.09 + urgency * 0.1; // ~0.10 → 0.19
  // …and it ticks in double time: an on-beat tick now, an off-beat one at +0.5s.
  tone({ freq, duration: 0.05, type: "square", gain });
  tone({ freq, duration: 0.05, type: "square", gain, startAt: 0.5 });
}

/**
 * Spoken milestone announcement ("30 seconds…"). Uses the Web Speech API — no
 * audio asset, works offline with the system voice — preceded by a short chime
 * so it lands even where speech synthesis is unavailable. Gated by the mute flag.
 */
export function announce(secondsLeft: number): void {
  if (muted || typeof window === "undefined") return;

  // Rising three-note "attention" fanfare, so there's always an unmistakable
  // marker even where speech synthesis is unavailable.
  tone({ freq: 784, duration: 0.12, type: "triangle", gain: 0.15 });
  tone({ freq: 988, duration: 0.12, type: "triangle", gain: 0.15, startAt: 0.11 });
  tone({ freq: 1319, duration: 0.2, type: "triangle", gain: 0.16, startAt: 0.22 });

  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.resume(); // in case the engine re-suspended between turns
    const u = new SpeechSynthesisUtterance(`${secondsLeft} seconds`);
    u.rate = 1;
    u.volume = 1;
    synth.speak(u);
  } catch {
    // No speech synthesis — the fanfare above still played.
  }
}

/** Time's up: a harsh two-blast buzzer. */
export function timeUp(): void {
  if (muted) return;
  tone({ freq: 210, duration: 0.3, type: "sawtooth", gain: 0.2 });
  tone({ freq: 180, duration: 0.45, type: "sawtooth", gain: 0.2, startAt: 0.32 });
}

/** Countdown 3 / 2 / 1 pip. */
export function beep(): void {
  if (muted) return;
  tone({ freq: 440, duration: 0.14, type: "triangle", gain: 0.16 });
}

/** Countdown GO! — a bright rising tone. */
export function go(): void {
  if (muted) return;
  tone({ freq: 660, duration: 0.28, type: "triangle", gain: 0.18, slideTo: 990 });
}

/** Per-turn score reveal sting. `positive` = a happy arpeggio, else a low sigh. */
export function reveal(positive: boolean): void {
  if (muted) return;
  if (positive) {
    tone({ freq: 523, duration: 0.12, type: "triangle", gain: 0.14 });
    tone({ freq: 659, duration: 0.12, type: "triangle", gain: 0.14, startAt: 0.1 });
    tone({ freq: 784, duration: 0.22, type: "triangle", gain: 0.15, startAt: 0.2 });
  } else {
    tone({ freq: 320, duration: 0.35, type: "sine", gain: 0.14, slideTo: 200 });
  }
}

/** Game over fanfare. */
export function win(): void {
  if (muted) return;
  const notes = [523, 659, 784, 1047]; // C E G C
  notes.forEach((f, i) =>
    tone({ freq: f, duration: 0.3, type: "square", gain: 0.13, startAt: i * 0.13 }),
  );
}
