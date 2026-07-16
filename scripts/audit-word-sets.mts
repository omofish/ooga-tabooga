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
import { containsEasy } from "../lib/gen.ts";
import type { WordCard } from "../lib/types.ts";

/**
 * Rule 5 heuristic: known non-word fragments that only exist as a fake split of
 * a single word (there is no "yester", "uni", "cran"…). This is a warning, not
 * a failure — it can't catch every case (the "fused word" half of Rule 5, e.g.
 * `Net Work`, needs a human eye) and may over-flag, but it reliably catches the
 * common offenders. Extend the list as new ones turn up.
 */
const NON_WORD_FRAGMENTS = new Set([
  "yester", "uni", "cran", "ade", "meg", "holi", "boysen", "huckle",
  "choco", "broc", "cauli", "rhu", "avoca", "orang", "utan", "wal",
]);

/** Words in the hard phrase that look like non-word fragments. */
function nonWordFragments(card: WordCard): string[] {
  return card.hard
    .split(/\s+/)
    .filter((w) => NON_WORD_FRAGMENTS.has(w.toLowerCase()));
}

let total = 0;
let ok = 0;
const failingSets: string[] = [];
const rule5Warnings: string[] = [];

for (const set of WORD_SETS) {
  const n = set.cards.length;
  const violations = set.cards.filter((c) => !containsEasy(c));
  const singleWord = set.cards.filter((c) => !c.hard.includes(" "));
  const fragged = set.cards.filter((c) => nonWordFragments(c).length > 0);
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
  for (const c of fragged) {
    rule5Warnings.push(`${set.name}: ${c.easy} → ${c.hard}`);
  }
}

console.log(
  `\nTOTAL contains-easy ${ok}/${total} (${((ok / total) * 100).toFixed(1)}%)`,
);
if (rule5Warnings.length) {
  console.log(`\nRule 5 warnings (possible fake single-word splits):`);
  for (const w of rule5Warnings) console.log(`        ⚠ ${w}`);
} else {
  console.log(`Rule 5: no known non-word fragments found.`);
}
if (failingSets.length) {
  console.log(`Sets failing the containment rule: ${failingSets.join(", ")}`);
  process.exitCode = 1;
}
