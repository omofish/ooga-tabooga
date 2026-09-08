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

/** Colour for the very top/bottom edge of the viewport, for whichever phase
 *  is showing — read by <ChromeEdges/> (see that file for why: iOS 26 Safari
 *  tints its own chrome from a fixed/sticky edge element's background-color).
 *  Deliberately mirrors each screen's own background exactly, value for
 *  value, rather than picking independently — see each `case` below for the
 *  matching screen. */
export function chromeEdgeColors(state: GameState): { top: string; bottom: string } {
  const team = state.teams.find((t) => t.id === state.active?.teamId);
  const c = colorForKey(team?.colorKey ?? TEAM_COLORS[0].key);

  switch (state.phase) {
    // Countdown/Gameplay/ScoreReveal fill the whole screen with the active
    // team's `base` colour (see each component's outer `style`).
    case "countdown":
    case "play":
    case "reveal":
      return { top: c.base, bottom: c.base };
    // RoundReview fills the whole screen with the active team's `soft` tint.
    case "review":
      return { top: c.soft, bottom: c.soft };
    // SetupScreen: a solid dark top bar over the plain cream body beneath.
    case "setup":
      return { top: "var(--color-ink)", bottom: "var(--color-body)" };
    // ScoreView and GameOver have no special background — plain cream body.
    case "score":
    case "gameover":
      return { top: "var(--color-body)", bottom: "var(--color-body)" };
  }
}
