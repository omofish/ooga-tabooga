"use client";

import { useMemo } from "react";

const COLORS = ["#E24A3B", "#2E7BD6", "#F2B01E", "#3DA95B", "#fff7e8", "#ff8fab"];

// Deterministic pseudo-random so render stays pure (no Math.random in render).
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 43.7) * 43758.5453;
  return x - Math.floor(x);
}

/** A burst of falling confetti pieces, purely decorative. Each grows in from
 *  nothing near the start of its fall and shrinks away before the end — both
 *  windows sized randomly per piece (see confetti-grow/-shrink in
 *  globals.css) so they don't all pop in and out in sync. */
export default function Confetti({ count = 44 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const duration = 2.2 + rand(i * 3.9) * 1.8;
        const delay = rand(i * 2.7) * 0.8;
        // 2x faster than a plain proportional grow-in.
        const growDuration = duration * (0.15 + rand(i * 7.7) * 0.25) * 0.5;
        const shrinkStart = duration * (0.45 + rand(i * 8.3) * 0.15);
        const shrinkDuration = duration * (0.15 + rand(i * 9.1) * 0.15);
        return {
          id: i,
          left: rand(i * 1.3) * 100,
          color: COLORS[i % COLORS.length],
          w: 8 + rand(i * 6.3) * 8,
          duration,
          delay,
          growDuration,
          shrinkDelay: delay + shrinkStart,
          shrinkDuration,
        };
      }),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.w * 1.3,
            background: p.color,
            animation: [
              `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
              `confetti-grow ${p.growDuration}s linear ${p.delay}s both`,
              `confetti-shrink ${p.shrinkDuration}s linear ${p.shrinkDelay}s forwards`,
            ].join(", "),
          }}
        />
      ))}
    </div>
  );
}
