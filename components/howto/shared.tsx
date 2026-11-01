import type { ReactNode } from "react";

/** The one card every example in the guide uses (it's a real Standard card). */
export const DEMO_CARD = { easy: "Moon", hard: "Honey Moon" } as const;

const CHIP_STYLE: Record<string, string> = {
  "+1": "bg-ink text-cream",
  "+3": "bg-amber-400 text-ink",
  "−1": "bg-ink/10 text-ink",
  "✓": "bg-ink text-cream",
};

/** Chunky point capsule, same look as the +1/+3 chips on the play cards.
 *  `.font-display` sits on the inner span (never the flex box) so the
 *  Luckiest Guy trim/nudge actually centres the label. */
export function PointChip({
  label,
  size = "sm",
}: {
  label: string;
  size?: "xs" | "sm" | "lg";
}) {
  const sizing =
    size === "xs"
      ? "border-2 px-1.5 text-[10px]"
      : size === "lg"
        ? "border-[3px] px-3 py-1 text-lg"
        : "border-2 px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border-ink leading-none ${sizing} ${CHIP_STYLE[label] ?? ""}`}
    >
      <span className="font-display">{label}</span>
    </span>
  );
}

/** Small uppercase role tag: "Chief", "Watcher", … */
export function RoleTag({
  children,
  bg,
  color = "#fff",
  className = "",
}: {
  children: ReactNode;
  bg: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-ink px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide ${className}`}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}
