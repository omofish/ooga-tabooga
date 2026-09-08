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

/** The active turn's team colour, defaulting to the first team colour when
 *  there's no active turn (setup/score/gameover) — shared by `topBarTheme`
 *  and `bottomBarTheme` so their in-turn cases can't drift apart. */
function activeTeamColor(state: GameState): TeamColor {
  const team = state.teams.find((t) => t.id === state.active?.teamId);
  return colorForKey(team?.colorKey ?? TEAM_COLORS[0].key);
}

/** Why `key` is part of both `topBarTheme`'s and `bottomBarTheme`'s return
 *  value, not just an incidental colour: `TopBar`/`BottomBar` are mounted
 *  unconditionally (never wrapped in a phase check), so changing only their
 *  style props would restyle the *same* persistent DOM node — which iOS 26
 *  Safari's chrome-colour sampling does NOT re-run for (confirmed: an
 *  earlier version of this exact feature did only that, and Safari never
 *  picked up the change). Passing this `key` as the component's React `key`
 *  forces React to unmount the old node and mount a genuinely new one
 *  whenever the theme changes — a real DOM edge-element change, which Safari
 *  DOES re-sample (confirmed: SetupScreen's bottom content has always worked
 *  this way, mounted only on that one phase, a real unmount). Same colour
 *  twice in a row (e.g. two renders mid-Gameplay) keeps the same key, so
 *  neither bar remounts on every re-render — only when the theme actually
 *  changes.
 *
 *  Top and bottom deliberately differ for setup/score/gameover: `TopBar`
 *  stays dark ink there (the app's own chrome), while `BottomBar` matches
 *  the plain page background instead of forcing a second dark bar — those
 *  three screens don't have a natural "themed" bottom the way the in-turn
 *  phases do. */

/** TopBar's colour for the current phase, mirroring the screen underneath it
 *  value-for-value (team `base` behind countdown/play/reveal, `soft` behind
 *  review, dark ink everywhere else) so the bar reads as part of the screen,
 *  not a separate strip. */
export function topBarTheme(
  state: GameState,
): { background: string; text: string; key: string } {
  const c = activeTeamColor(state);

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

/** BottomBar's colour for the current phase — same team `base`/`soft` as
 *  `topBarTheme` behind the in-turn phases, but the plain page background
 *  (not dark ink) behind setup/score/gameover. */
export function bottomBarTheme(state: GameState): { background: string; key: string } {
  const c = activeTeamColor(state);

  switch (state.phase) {
    case "countdown":
    case "play":
    case "reveal":
      return { background: c.base, key: `base-${c.key}` };
    case "review":
      return { background: c.soft, key: `soft-${c.key}` };
    case "setup":
    case "score":
    case "gameover":
      return { background: "var(--color-body)", key: "body" };
  }
}
