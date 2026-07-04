// Auto-generated caveman names used as the default (editable) player name.
// Duplicates across turns are fine — this is just a fun default.

export const CAVE_NAMES = [
  "Grog",
  "Thok",
  "Ugga",
  "Mog",
  "Zug",
  "Bork",
  "Nok",
  "Krunk",
  "Oona",
  "Rok",
  "Durt",
  "Blorg",
  "Ug",
  "Gronk",
  "Naka",
  "Thak",
  "Murg",
  "Brak",
  "Wug",
  "Grunk",
  "Ootoo",
  "Zonk",
  "Fka",
  "Snarl",
  "Boff",
  "Grim",
  "Klok",
  "Ug-Lee",
  "Meep",
];

export function randomCaveName(): string {
  return CAVE_NAMES[Math.floor(Math.random() * CAVE_NAMES.length)];
}
