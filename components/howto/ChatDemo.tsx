"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DEMO_CARD, PointChip } from "./shared";

/** One line of a scripted chat. `act` is a grey "what the chief tapped" pill;
 *  `card` changes the mini card strip at the top; `result` ends the chat. */
export type ChatLine =
  | { kind: "chief" | "guess" | "watch"; text: string }
  | { kind: "act"; text: string; card?: CardState }
  | { kind: "bonk" }
  | { kind: "result"; chip: "+1" | "+3" | "−1" | "✓"; text: string };

type CardState = "easy" | "hard" | "dead";

const LABEL = { chief: "Chief", guess: "Tribe", watch: "Watcher" } as const;

/** Auto-plays a short chat, one bubble at a time with a typing "…" before
 *  each, then shows a Replay button. With reduced motion, everything shows
 *  at once. */
export default function ChatDemo({
  lines,
  startCard,
}: {
  lines: ChatLine[];
  startCard?: CardState;
}) {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [bonking, setBonking] = useState(false);
  const [run, setRun] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    /* eslint-disable react-hooks/set-state-in-effect -- resetting the
       timeline at the start of each (re)play is the point of this effect */
    setShown(0);
    setTyping(false);
    setBonking(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (reduce) {
      at(0, () => setShown(lines.length));
      return () => timers.forEach(clearTimeout);
    }

    let t = 300;
    lines.forEach((line, i) => {
      if (line.kind === "chief" || line.kind === "guess" || line.kind === "watch") {
        at(t, () => setTyping(true));
        t += 650;
        at(t, () => {
          setTyping(false);
          setShown(i + 1);
        });
        t += 700 + line.text.length * 18;
      } else if (line.kind === "bonk") {
        at(t, () => {
          setBonking(true);
          setShown(i + 1);
        });
        at(t + 750, () => setBonking(false));
        t += 800;
      } else {
        at(t, () => setShown(i + 1));
        t += 1100;
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [lines, run]);

  // Keep the newest bubble in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  const visible = lines.slice(0, shown);
  const card = visible.reduce<CardState | undefined>(
    (c, l) => (l.kind === "act" && l.card ? l.card : c),
    startCard,
  );
  const next = lines[shown];
  const typingKind =
    typing && next && (next.kind === "chief" || next.kind === "guess" || next.kind === "watch")
      ? next.kind
      : null;
  const done = shown >= lines.length;
  const hasWatcher = lines.some((l) => l.kind === "watch");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-[1fr_1.25fr] gap-2">
        <MiniCard
          word={DEMO_CARD.easy}
          chip="+1"
          hit={card === "easy" || card === "hard"}
          dead={card === "dead"}
        />
        <MiniCard
          word={DEMO_CARD.hard}
          chip="+3"
          hit={card === "hard"}
          dead={card === "dead"}
          hard
        />
      </div>

      <div className="mt-2.5 flex justify-center gap-3 text-[11px] font-black uppercase tracking-wide text-ink-soft">
        <Key color="var(--h-red)">Chief</Key>
        <Key color="var(--h-red-soft)">Tribe</Key>
        {hasWatcher && <Key color="var(--h-blue)">Watcher</Key>}
      </div>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-0.5 pb-9 pt-1.5"
      >
        {/* The typing "…" is the next line's own bubble (same key), so when
            the text arrives React swaps the dots for the words in place: the
            sender label and bubble don't re-mount or re-animate. */}
        {(typingKind ? [...visible, next] : visible).map((line, i) => (
          <Line key={`${run}-${i}`} line={line} typing={i === shown} />
        ))}
      </div>

      {bonking && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="howto-bonk-fx text-7xl">🦴</span>
        </div>
      )}

      {done && (
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="absolute bottom-0 right-0 rounded-full border-2 border-ink bg-cream px-3 py-1 text-xs font-black text-ink"
        >
          ↻ Replay
        </button>
      )}
    </div>
  );
}

function Line({ line, typing }: { line: ChatLine; typing: boolean }) {
  switch (line.kind) {
    case "chief":
    case "guess":
    case "watch":
      return (
        <Bubble kind={line.kind}>
          {typing ? (
            <span className="howto-typing inline-flex gap-1 py-1">
              <span />
              <span />
              <span />
            </span>
          ) : (
            <span className="howto-fade">{line.text}</span>
          )}
        </Bubble>
      );
    case "act":
      return (
        <div className="animate-pop self-center rounded-full bg-ink/10 px-3 py-1 text-xs font-black text-ink">
          {line.text}
        </div>
      );
    case "bonk":
      return null;
    case "result":
      return (
        <div
          className="animate-pop mt-1 flex items-center gap-2 self-center rounded-full border-[3px] border-ink py-1.5 pl-1.5 pr-3"
          style={{ background: "#fffdf5", boxShadow: "0 4px 0 0 var(--color-ink)" }}
        >
          <PointChip label={line.chip} size="lg" />
          <span className="text-sm font-bold text-ink">{line.text}</span>
        </div>
      );
  }
}

function Bubble({
  kind,
  children,
}: {
  kind: "chief" | "guess" | "watch";
  children: ReactNode;
}) {
  const align =
    kind === "chief" ? "self-start" : kind === "guess" ? "self-end text-right" : "self-center text-center";
  return (
    <div className={`animate-rise max-w-[80%] ${align}`}>
      <div className="mx-1.5 mb-0.5 text-[10.5px] font-black uppercase tracking-wide text-ink-soft">
        {LABEL[kind]}
      </div>
      <div className={`howto-bubble howto-bubble-${kind} text-left ${kind === "watch" ? "text-center" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function MiniCard({
  word,
  chip,
  hit,
  dead,
  hard,
}: {
  word: string;
  chip: "+1" | "+3";
  hit: boolean;
  dead: boolean;
  hard?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center gap-1.5 rounded-xl border-[3px] border-ink px-1.5 py-2 text-center transition-[opacity,background-color] duration-300 ${dead ? "opacity-45" : ""}`}
      style={{ background: hit ? "#fff1cc" : hard ? "#fffdf5" : "var(--color-cream)" }}
    >
      <span className="font-display text-base text-ink">{word}</span>
      <PointChip label={chip} />
      {hit && (
        <span
          aria-hidden
          className="animate-pop absolute -right-2 -top-2.5 grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-ink text-xs font-black text-white"
          style={{ background: "#3da95b" }}
        >
          ✓
        </span>
      )}
    </div>
  );
}

function Key({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      <i
        className="inline-block h-2.5 w-2.5 rounded-full border-2 border-ink"
        style={{ background: color }}
      />
      {children}
    </span>
  );
}
