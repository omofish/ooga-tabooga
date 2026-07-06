import type { WordCard } from "./types";

// Shared helpers for building large word sets from compact source data.

/** Drop single-word "hards", self-references, and duplicate hard phrases. */
export function dedupe(cards: WordCard[]): WordCard[] {
  const seen = new Set<string>();
  const out: WordCard[] = [];
  for (const c of cards) {
    const easy = c.easy.trim();
    const hard = c.hard.trim();
    if (!hard.includes(" ")) continue;
    if (easy.toLowerCase() === hard.toLowerCase()) continue;
    const key = hard.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ easy, hard });
  }
  return out;
}

/**
 * Dedupe by hard phrase and drop self-references, but KEEP single-word hards.
 * Used for curated title sets (Movies, Songs) where "Frozen" or "Titanic" are
 * legitimate one-word answers.
 */
export function unique(cards: WordCard[]): WordCard[] {
  const seen = new Set<string>();
  const out: WordCard[] = [];
  for (const c of cards) {
    const easy = c.easy.trim();
    const hard = c.hard.trim();
    if (easy.toLowerCase() === hard.toLowerCase()) continue;
    const key = hard.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ easy, hard });
  }
  return out;
}

/** Expand a [easy, [hard, ...]] table into cards. */
export function fromTable(table: [string, string[]][]): WordCard[] {
  return dedupe(
    table.flatMap(([easy, hards]) => hards.map((hard) => ({ easy, hard }))),
  );
}

/**
 * Cross a list of modifiers with a list of nouns → "Modifier Noun" cards, with
 * the noun as the easy 1-point word. Adjective+noun almost always reads
 * naturally, which keeps generated themed sets sensible.
 */
export function cross(modifiers: string[], nouns: string[]): WordCard[] {
  return dedupe(
    nouns.flatMap((n) => modifiers.map((m) => ({ easy: n, hard: `${m} ${n}` }))),
  );
}
