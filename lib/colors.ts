// Team colours. The active team's colour themes the whole gameplay UI.
// Order matters: the spec asks for red, then blue, then yellow, then green.

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

