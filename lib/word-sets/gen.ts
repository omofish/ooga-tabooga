import type { WordCard } from "../types";

/** A compact source row: one easy word and the hard phrases that contain it. */
export type Entry = [easy: string, hards: string[]];

// Shared helpers for building word sets from compact source data.
//
// Rule 2 (docs/word-set-guidelines.md) is enforced here: a card is only kept if
// the hard phrase contains the easy word as a whole word. That makes it
// impossible to ship a containment violation regardless of the source data —
// the audit script is the backstop, this is the guard rail.

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True if `hard` contains `easy` as a whole word (case-insensitive). */
export function containsEasy(card: WordCard): boolean {
  return new RegExp(`\\b${esc(card.easy)}\\b`, "i").test(card.hard);
}

/**
 * Keep only valid, unique cards:
 *  - the hard phrase must contain the easy word (Rule 2),
 *  - drop self-references (easy === hard),
 *  - drop duplicate hard phrases.
 */
export function build(cards: WordCard[]): WordCard[] {
  const seen = new Set<string>();
  const out: WordCard[] = [];
  for (const raw of cards) {
    const card = { easy: raw.easy.trim(), hard: raw.hard.trim() };
    if (card.easy.toLowerCase() === card.hard.toLowerCase()) continue;
    if (!containsEasy(card)) continue;
    const key = card.hard.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(card);
  }
  return out;
}

/** Expand a `[easy, [hard, …]]` table into validated cards. */
export function fromTable(table: Entry[]): WordCard[] {
  return build(table.flatMap(([easy, hards]) => hards.map((hard) => ({ easy, hard }))));
}
