import type { WordCard } from "../types";
import { fromTable } from "./gen";

// Internet Slang: the easy 1-point word is a slang term or the noun inside
// one; the hard 3-point phrase is the real, widely-known compound it lives
// in (Aura → "Aura Farming"). Curated only — no adjective+noun filler.

const TABLE: [string, string[]][] = [
  ["Aura", ["Aura Farming"]],
  ["Sigma", ["Sigma Male"]],
  ["Skibidi", ["Skibidi Toilet"]],
  ["Rizz", ["Unspoken Rizz"]],
  ["Era", ["Villain Era", "Flop Era"]],
  ["Grass", ["Touch Grass"]],
  ["Flag", ["Red Flag", "Green Flag", "Beige Flag"]],
  ["Cap", ["No Cap"]],
  ["Rent", ["Rent Free"]],
  ["Character", ["Main Character"]],
  ["Dinner", ["Girl Dinner"]],
  ["Boss", ["Girl Boss"]],
  ["Rot", ["Brain Rot"]],
  ["Core", ["Cottage Core"]],
  ["Meme", ["Meme Lord"]],
  ["Lord", ["Cringe Lord"]],
  ["Check", ["Vibe Check", "Fit Check"]],
  ["Zone", ["Friend Zone"]],
  ["Queen", ["Drama Queen"]],
  ["Life", ["Best Life"]],
  ["Culture", ["Cancel Culture"]],
  ["Clout", ["Clout Chaser"]],
  ["Trait", ["Toxic Trait"]],
  ["Energy", ["Main Character Energy"]],
  ["Holiday", ["Jet2 Holiday"]],
  ["Tax", ["Fanum Tax"]],
  ["Guy", ["Chill Guy"]],
  ["Demure", ["Very Demure"]],
  ["Grimace", ["Grimace Shake"]],
  ["Math", ["Girl Math"]],
  ["Online", ["Chronically Online"]],
];

export const INTERNET_SLANG_CARDS: WordCard[] = fromTable(TABLE);
