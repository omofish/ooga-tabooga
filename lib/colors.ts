// Team colours. The active team's colour themes the whole gameplay UI.
// Order matters: the spec asks for red, then blue, then yellow, then green.

import type { GameState } from "./types";

export type TeamColor = {
  key: string;
  label: string; // "Red"
  mascot: string; // thematic emoji
  base: string; // main accent
  dark: string; // borders / pressed states
  deep: string; // strong gradient / heading text on light bg
  soft: string; // pale tint for backgrounds
  onBase: string; // readable text colour on top of `base`
};

export const TEAM_COLORS: TeamColor[] = [
  {
    key: "red",
    label: "Red",
    mascot: "🔥",
    base: "#E24A3B",
    dark: "#B4322A",
    deep: "#7E211B",
    soft: "#FBE3E0",
    onBase: "#FFFFFF",
  },
  {
    key: "blue",
    label: "Blue",
    mascot: "🦣",
    base: "#2E7BD6",
    dark: "#215FA8",
    deep: "#153E6E",
    soft: "#DEEBFA",
    onBase: "#FFFFFF",
  },
  {
    key: "yellow",
    label: "Yellow",
    mascot: "☀️",
    base: "#F2B01E",
    dark: "#CE9412",
    deep: "#7A5606",
    soft: "#FBEECB",
    onBase: "#4A3105",
  },
  {
    key: "green",
    label: "Green",
    mascot: "🌿",
    base: "#3DA95B",
    dark: "#2C8145",
    deep: "#18512A",
    soft: "#DEF2E3",
    onBase: "#FFFFFF",
  },
];

export function colorForKey(key: string): TeamColor {
  return TEAM_COLORS.find((c) => c.key === key) ?? TEAM_COLORS[0];
}

/** CSS custom properties for a team colour, spread onto a container's style. */
export function colorVars(c: TeamColor): React.CSSProperties {
  return {
    ["--team-base" as string]: c.base,
    ["--team-dark" as string]: c.dark,
    ["--team-deep" as string]: c.deep,
    ["--team-soft" as string]: c.soft,
    ["--team-on" as string]: c.onBase,
  };
}

/** TopBar's colour for the current phase, mirroring the screen underneath it
 *  value-for-value (team `base` behind countdown/play/reveal, `soft` behind
 *  review, dark ink everywhere else) so the bar reads as part of the screen,
 *  not a separate strip. `key` is deliberately part of the return value, not
 *  just the colours: TopBar is mounted unconditionally (never wrapped in a
 *  phase check), so changing only its style props would restyle the *same*
 *  persistent DOM node — which iOS 26 Safari's chrome-colour sampling does
 *  NOT re-run for (confirmed: an earlier version of this exact feature did
 *  only that, and Safari never picked up the change). Passing this `key` to
 *  <TopBar/> forces React to unmount the old node and mount a genuinely new
 *  one whenever the theme changes — a real DOM edge-element change, which
 *  Safari does re-sample (confirmed by SetupScreen's fixed bottom bar, which
 *  has always worked this way: mounted only on that one phase, so leaving it
 *  is a real unmount, and its colour reliably falls away). Same colour twice
 *  in a row (e.g. two renders mid-Gameplay) keeps the same key, so it does
 *  *not* remount on every re-render — only when the theme actually changes. */
export function topBarTheme(
  state: GameState,
): { background: string; text: string; key: string } {
  const team = state.teams.find((t) => t.id === state.active?.teamId);
  const c = colorForKey(team?.colorKey ?? TEAM_COLORS[0].key);

  switch (state.phase) {
    case "countdown":
    case "play":
    case "reveal":
      return { background: c.base, text: c.onBase, key: `base-${c.key}` };
    case "review":
      return { background: c.soft, text: "var(--color-ink)", key: `soft-${c.key}` };
    case "setup":
    case "score":
    case "gameover":
      return { background: "var(--color-ink)", text: "var(--color-cream)", key: "ink" };
  }
}
