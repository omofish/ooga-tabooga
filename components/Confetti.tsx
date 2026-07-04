"use client";

import { useMemo } from "react";

const COLORS = ["#E24A3B", "#2E7BD6", "#F2B01E", "#3DA95B", "#fff7e8", "#ff8fab"];

// Deterministic pseudo-random so render stays pure (no Math.random in render).
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 43.7) * 43758.5453;
  return x - Math.floor(x);
}

/** A burst of falling confetti pieces, purely decorative. */
export default function Confetti({ count = 44 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(i * 1.3) * 100,
        delay: rand(i * 2.7) * 0.8,
        duration: 2.2 + rand(i * 3.9) * 1.8,
        color: COLORS[i % COLORS.length],
        rotate: rand(i * 5.1) * 360,
        w: 8 + rand(i * 6.3) * 8,
      })),
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
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
