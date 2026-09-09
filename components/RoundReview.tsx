"use client";

import { useEffect, useRef, useState } from "react";
import { colorForKey, colorVars } from "@/lib/colors";
import { scoreTurn } from "@/lib/game";
import { BUCKET_POINTS, type Bucket, type ResolvedCard } from "@/lib/types";
import type { ScreenProps } from "./types";

type BucketDef = {
  key: Bucket;
  label: string;
  bg: string;
  chip: string;
};

const BUCKETS: BucketDef[] = [
  { key: "hard", label: "+3", bg: "#fbe7c2", chip: "#fff6df" },
  { key: "easy", label: "+1", bg: "#dbeafe", chip: "#f2f8ff" },
  { key: "pass", label: "−1", bg: "#f9dcd8", chip: "#fdeeec" },
];

const CYCLE: Bucket[] = ["hard", "easy", "pass"];

type DragState = {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  over: Bucket | null;
};

export default function RoundReview({ state, dispatch }: ScreenProps) {
  const active = state.active;
  const team = state.teams.find((t) => t.id === active?.teamId);
  const c = colorForKey(team?.colorKey ?? "red");

  const bucketRefs = useRef<Record<Bucket, HTMLDivElement | null>>({
    hard: null,
    easy: null,
    pass: null,
  });
  const [drag, setDrag] = useState<DragState | null>(null);

  const cards = active?.resolved ?? [];

  function bucketAt(x: number, y: number): Bucket | null {
    for (const key of CYCLE) {
      const el = bucketRefs.current[key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key;
    }
    return null;
  }

  // Window listeners while a drag is in progress.
  useEffect(() => {
    if (!drag) return;
    const id = drag.id;
    const startX = drag.startX;
    const startY = drag.startY;

    function onMove(e: PointerEvent) {
      const over = bucketAt(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, over } : d));
    }
    function onUp(e: PointerEvent) {
      const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (moved > 8) {
        const over = bucketAt(e.clientX, e.clientY);
        if (over) dispatch({ type: "MOVE_CARD", id, bucket: over });
      } else {
        // Treat a tap as "cycle to next bucket" — a forgiving fallback.
        const card = cards.find((cc) => cc.id === id);
        if (card) {
          const next = CYCLE[(CYCLE.indexOf(card.bucket) + 1) % CYCLE.length];
          dispatch({ type: "MOVE_CARD", id, bucket: next });
        }
      }
      setDrag(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id]);

  if (!active) return null;

  const adjust = active.scoreAdjust ?? 0;
  const total = scoreTurn(cards) + adjust;
  const draggingCard = drag ? cards.find((cc) => cc.id === drag.id) : null;

  return (
    <div
      className="flex h-[100svh] flex-col px-4 pb-4 pt-5 no-select"
      style={{ ...colorVars(c), background: c.soft }}
    >
      <header className="text-center">
        <h1 className="font-display text-shadow-pop text-2xl" style={{ color: c.deep }}>
          Sort the loot!
        </h1>
        <p className="mt-3 text-xs font-bold text-ink-soft">
          Drag or tap a card to fix where it landed. Then bank the score.
        </p>
      </header>

      {/* pb-2: the last .chunk bucket has no gap-2.5 sibling below it to
          catch its 5px drop-shadow, so without this the scroll container's
          own overflow clips that shadow off flush at the bottom. */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pb-2">
        {BUCKETS.map((b) => {
          const inBucket = cards.filter((card) => card.bucket === b.key);
          const isOver = drag?.over === b.key;
          return (
            <div
              key={b.key}
              ref={(el) => {
                bucketRefs.current[b.key] = el;
              }}
              className="chunk flex flex-1 flex-col rounded-2xl p-2.5 transition-transform"
              style={{
                background: b.bg,
                transform: isOver ? "scale(1.015)" : undefined,
                boxShadow: isOver
                  ? "0 5px 0 0 var(--color-ink), 0 0 0 3px var(--team-base)"
                  : undefined,
              }}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="inline-flex items-center rounded-lg border-2 border-ink bg-cream px-2.5 py-1.5 text-lg text-ink">
                  <span className="font-display">{b.label}</span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
                  {b.key === "hard"
                    ? "nailed the phrase"
                    : b.key === "easy"
                      ? "got the word"
                      : "passed / missed"}
                </span>
                <span className="ml-auto text-xs font-bold text-ink-soft">
                  {inBucket.length}
                </span>
              </div>
              <div className="flex flex-wrap content-start gap-2">
                {inBucket.length === 0 && (
                  <span className="px-1 py-2 text-xs font-bold text-ink-soft/60">
                    drop cards here…
                  </span>
                )}
                {inBucket.map((card) => (
                  <CardChip
                    key={card.id}
                    card={card}
                    chipBg={b.chip}
                    dim={drag?.id === card.id}
                    onDown={(e) =>
                      setDrag({
                        id: card.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        x: e.clientX,
                        y: e.clientY,
                        over: b.key,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual adjustment + live total + confirm */}
      <footer className="mt-3 flex flex-col gap-2.5">
        {/* Nudge the score by hand for anything the buckets can't capture. */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            Adjust
          </span>
          <button
            onClick={() => dispatch({ type: "ADJUST_SCORE", delta: -1 })}
            aria-label="Subtract one point"
            className="btn btn-cream flex h-9 w-12 items-center justify-center rounded-xl text-lg"
          >
            <span className="font-display">−1</span>
          </button>
          <span className="w-8 text-center font-display text-lg text-ink">
            {adjust > 0 ? `+${adjust}` : adjust}
          </span>
          <button
            onClick={() => dispatch({ type: "ADJUST_SCORE", delta: 1 })}
            aria-label="Add one point"
            className="btn btn-cream flex h-9 w-12 items-center justify-center rounded-xl text-lg"
          >
            <span className="font-display">+1</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="chunk flex flex-col items-center rounded-2xl px-4 py-2">
            <span className="text-[10px] font-extrabold uppercase text-ink-soft">
              Score
            </span>
            <span className="font-display text-2xl text-ink">{total}</span>
          </div>
          <button
            onClick={() => dispatch({ type: "CONFIRM_REVIEW" })}
            className="btn btn-team flex-1 py-4 text-xl"
          >
            <span className="font-display">Bank Score ✓</span>
          </button>
        </div>
      </footer>

      {/* Floating drag ghost */}
      {draggingCard && drag && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -50%) rotate(-4deg) scale(1.08)",
          }}
        >
          <ChipInner card={draggingCard} chipBg="#fff" lifted />
        </div>
      )}
    </div>
  );
}

function CardChip({
  card,
  chipBg,
  dim,
  onDown,
}: {
  card: ResolvedCard;
  chipBg: string;
  dim: boolean;
  onDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      onPointerDown={onDown}
      className="touch-none text-left"
      style={{ touchAction: "none", opacity: dim ? 0.25 : 1 }}
    >
      <ChipInner card={card} chipBg={chipBg} />
    </button>
  );
}

function ChipInner({
  card,
  chipBg,
  lifted,
}: {
  card: ResolvedCard;
  chipBg: string;
  lifted?: boolean;
}) {
  return (
    <div
      className="rounded-xl border-2 border-ink px-2.5 py-1.5"
      style={{
        background: chipBg,
        boxShadow: lifted ? "0 8px 14px rgba(0,0,0,0.35)" : "0 3px 0 0 var(--color-ink)",
        maxWidth: "10rem",
      }}
    >
      <div className="font-display text-sm leading-tight text-ink">
        {card.card.easy}
      </div>
      <div className="truncate text-[10px] font-bold text-ink-soft">
        {card.card.hard} · {BUCKET_POINTS[card.bucket] > 0 ? "+" : ""}
        {BUCKET_POINTS[card.bucket]}
      </div>
    </div>
  );
}
