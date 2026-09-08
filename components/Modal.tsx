"use client";

import type { CSSProperties, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * The app's STANDARD modal, built on Radix's Dialog primitive. Future agents:
 * reuse this for every dialog / confirm prompt — do NOT reach for
 * `window.confirm`/`alert` or hand-roll another overlay. Radix gives us (for
 * free, and more reliably than the old hand-rolled div) a focus trap, Escape
 * / outside-tap dismiss, and — importantly — background scroll lock, so the
 * page behind the dialog can't be scrolled while it's open.
 *
 * Renders a dimmed backdrop (tap to dismiss) and a chunky card with a close
 * button in the top-right corner. Pass team `colorVars(...)` via `style` to
 * theme the `--team-*` custom properties used inside. `title` is the dialog's
 * accessible name (screen-reader only — every caller already shows its own
 * heading visually, so this doesn't duplicate it on screen).
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
  title,
}: {
  onClose: () => void;
  children: ReactNode;
  style?: CSSProperties;
  title: string;
}) {
  return (
    <Dialog.Root open onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="chunk-lg animate-pop origin-top fixed left-1/2 top-1/2 z-50 max-h-[calc(100svh-5rem)] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl p-6 outline-none"
          style={style}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>

          <Dialog.Close
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
          </Dialog.Close>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
