"use client";

import { useMemo } from "react";

const COLORS = ["#E24A3B", "#2E7BD6", "#F2B01E", "#3DA95B", "#fff7e8", "#ff8fab"];

// Deterministic pseudo-random so render stays pure (no Math.random in render).
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 43.7) * 43758.5453;
  return x - Math.floor(x);
}

/** A burst of confetti pieces fired in from the left and right edges, arcing
 *  across the screen. Sideways rather than top-down so it never depends on
 *  the true top of a mobile browser's viewport (see confetti-fly in
 *  globals.css). */
export default function Confetti({ count = 44 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const fromLeft = i % 2 === 0;
        const spread = 30 + rand(i * 4.1) * 50; // vw travelled across the screen
        const x0 = fromLeft ? -20 : 120;
        const rotate = rand(i * 5.1) * 360;
        return {
          id: i,
          top: 10 + rand(i * 1.3) * 70,
          x0,
          x1: fromLeft ? x0 + spread : x0 - spread,
          y1: -10 + rand(i * 6.7) * 20,
          r0: rotate,
          r1: rotate + 720,
          delay: rand(i * 2.7) * 0.5,
          duration: 1.4 + rand(i * 3.9) * 1.1,
          color: COLORS[i % COLORS.length],
          w: 8 + rand(i * 6.3) * 8,
        };
      }),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              top: `${p.top}%`,
              width: p.w,
              height: p.w * 1.3,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--x0": `${p.x0}vw`,
              "--x1": `${p.x1}vw`,
              "--y1": `${p.y1}vh`,
              "--r0": `${p.r0}deg`,
              "--r1": `${p.r1}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
