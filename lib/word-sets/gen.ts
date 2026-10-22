import type { WordCard } from "../types";

/** A compact source row: one easy word and the hard phrases that contain it. */
export type Entry = [easy: string, hards: string[]];

// Shared helpers for building word sets from compact source data.
//
// Rule 2 (docs/word-set-guidelines.md) is enforced here: a card is only kept if
// the hard phrase contains the easy word as a whole word. That makes it
// impossible to ship a containment violation regardless of the source data.
// Every dropped card is recorded in `droppedCards`; the audit fails on
// containment and self-reference drops so a bad row can't silently vanish.
// Duplicate drops are expected (a compound listed under both of its words).

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
export type DropReason = "self-reference" | "containment" | "duplicate";

/** Cards `build()` has dropped so far, for the audit to report. */
export const droppedCards: { card: WordCard; reason: DropReason }[] = [];

export function build(cards: WordCard[]): WordCard[] {
  const seen = new Set<string>();
  const out: WordCard[] = [];
  const drop = (card: WordCard, reason: DropReason) => droppedCards.push({ card, reason });
  for (const raw of cards) {
    const card = { easy: raw.easy.trim(), hard: raw.hard.trim() };
    if (card.easy.toLowerCase() === card.hard.toLowerCase()) {
      drop(card, "self-reference");
      continue;
    }
    if (!containsEasy(card)) {
      drop(card, "containment");
      continue;
    }
    const key = card.hard.toLowerCase();
    if (seen.has(key)) {
      drop(card, "duplicate");
      continue;
    }
    seen.add(key);
    out.push(card);
  }
  return out;
}

/** Expand a `[easy, [hard, …]]` table into validated cards. */
export function fromTable(table: Entry[]): WordCard[] {
  return build(table.flatMap(([easy, hards]) => hards.map((hard) => ({ easy, hard }))));
}
