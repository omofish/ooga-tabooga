"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * The app's STANDARD modal. Future agents: reuse this for every dialog /
 * confirm prompt — do NOT reach for `window.confirm`/`alert` or hand-roll
 * another overlay. It renders a dimmed backdrop (tap to dismiss) and a chunky
 * card with a close button in the top-right corner. Pass team `colorVars(...)`
 * via `style` to theme the `--team-*` custom properties used inside.
 *
 * Note: the close button deliberately avoids the `.btn` class. `.btn` sets
 * `position: relative` as unlayered CSS, which outranks Tailwind's `absolute`
 * utility (utilities layer), so `.btn.absolute` would NOT be absolutely
 * positioned. We replicate the chunky look inline instead.
 */
export default function Modal({
  onClose,
  children,
  style,
}: {
  onClose: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="chunk-lg animate-pop relative z-10 w-full max-w-sm rounded-3xl p-6"
        style={style}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream text-ink active:translate-y-[2px]"
          style={{ boxShadow: "0 3px 0 0 var(--color-ink)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full p-[7px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  );
}
