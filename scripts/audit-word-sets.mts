/**
 * Word-set audit — checks every card against the guidelines in
 * docs/word-set-guidelines.md that can be verified automatically.
 *
 * Run:  npx tsx scripts/audit-word-sets.mts
 *
 * The only hard, machine-checkable rule is containment:
 *   the 3-point `hard` phrase MUST contain the 1-point `easy` word (whole word,
 *   case-insensitive). "Well-known" and "not-nonsense" are judgement calls and
 *   are only flagged heuristically (single-word hards, easy===hard).
 */
import { WORD_SETS } from "../lib/words.ts";
import type { WordCard } from "../lib/types.ts";

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Does the hard phrase contain the easy word as a whole word? */
export function containsEasy(card: WordCard): boolean {
  return new RegExp(`\\b${esc(card.easy)}\\b`, "i").test(card.hard);
}

let total = 0;
let ok = 0;
const failingSets: string[] = [];

for (const set of WORD_SETS) {
  const n = set.cards.length;
  const violations = set.cards.filter((c) => !containsEasy(c));
  const singleWord = set.cards.filter((c) => !c.hard.includes(" "));
  const pass = n - violations.length;
  total += n;
  ok += pass;
  const pct = ((pass / n) * 100).toFixed(1);
  const flag = violations.length === 0 ? "OK " : "FAIL";
  console.log(
    `[${flag}] ${set.name.padEnd(16)} ${String(n).padStart(4)} cards  ` +
      `contains-easy ${pass}/${n} (${pct}%)  single-word-hard ${singleWord.length}`,
  );
  if (violations.length) {
    failingSets.push(set.name);
    for (const v of violations.slice(0, 8)) {
      console.log(`        ✗ ${v.easy}  →  ${v.hard}`);
    }
    if (violations.length > 8) console.log(`        … and ${violations.length - 8} more`);
  }
}

console.log(
  `\nTOTAL contains-easy ${ok}/${total} (${((ok / total) * 100).toFixed(1)}%)`,
);
if (failingSets.length) {
  console.log(`Sets failing the containment rule: ${failingSets.join(", ")}`);
  process.exitCode = 1;
}
