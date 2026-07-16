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
 *
 * Two softer signals are printed as warnings, never failures:
 *   - Rule 5: hard phrases that look like fake single-word splits.
 *   - Base-word rule: base (+1) words that are function words (prepositions,
 *     adverbs, pronouns…) rather than nouns — the "over" problem.
 * Each set also reports its unique-base count: the same base word never repeats
 * in one game (buildDeck dedupes), so that is the real per-game deck size.
 */
import { WORD_SETS } from "../lib/word-sets/index.ts";
import { containsEasy } from "../lib/word-sets/gen.ts";
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

/**
 * Base-word rule heuristic: function words that make weak +1 base words because
 * they are not nouns — a clue giver can't easily get "Over" or "Up" guessed.
 * This is a warning, not a failure: it only lists clear closed-class words
 * (prepositions, particles, pronouns, articles, conjunctions and unambiguous
 * adverbs), so it under-flags — weak adjective/verb bases still need a human
 * eye. It deliberately omits words that are commonly nouns too (Back, Cross,
 * Light…). Extend as new offenders turn up.
 */
const NON_NOUN_BASES = new Set([
  // prepositions / particles
  "over", "under", "up", "down", "out", "off", "on", "in", "above", "below",
  "into", "onto", "upon", "across", "through", "around", "about", "after",
  "before", "between", "beyond", "behind", "within", "without", "against",
  "along", "among", "amid", "toward", "towards", "past", "via", "per", "near",
  "beside", "atop", "unto", "throughout",
  // adverbs
  "very", "really", "too", "also", "just", "only", "even", "still", "again",
  "away", "here", "there", "now", "then", "soon", "always", "never", "often",
  "quite", "rather", "almost", "once", "twice", "yet", "ever", "else",
  // pronouns
  "i", "me", "my", "mine", "you", "your", "he", "him", "his", "she", "her",
  "it", "its", "we", "us", "our", "they", "them", "their", "this", "that",
  "these", "those", "who", "whom", "whose", "which", "what",
  // articles / conjunctions / determiners
  "the", "a", "an", "and", "or", "but", "nor", "so", "if", "than", "as",
  "because", "while", "although", "though", "either", "neither", "each",
  "every", "any", "some", "no", "few", "many", "much", "more", "most", "less",
  "least", "such", "same", "other", "not",
]);

let total = 0;
let ok = 0;
const failingSets: string[] = [];
const rule5Warnings: string[] = [];
const baseWordWarnings: string[] = [];

for (const set of WORD_SETS) {
  const n = set.cards.length;
  const violations = set.cards.filter((c) => !containsEasy(c));
  const singleWord = set.cards.filter((c) => !c.hard.includes(" "));
  const fragged = set.cards.filter((c) => nonWordFragments(c).length > 0);
  const bases = new Set(set.cards.map((c) => c.easy.toLowerCase()));
  const badBases = [...bases].filter((b) => NON_NOUN_BASES.has(b)).sort();
  const pass = n - violations.length;
  total += n;
  ok += pass;
  const pct = ((pass / n) * 100).toFixed(1);
  const flag = violations.length === 0 ? "OK " : "FAIL";
  console.log(
    `[${flag}] ${set.name.padEnd(16)} ${String(n).padStart(4)} cards  ` +
      `contains-easy ${pass}/${n} (${pct}%)  unique-base ${String(bases.size).padStart(3)}  ` +
      `single-word-hard ${singleWord.length}`,
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
  if (badBases.length) {
    baseWordWarnings.push(`${set.name}: ${badBases.join(", ")}`);
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
if (baseWordWarnings.length) {
  console.log(`\nBase-word warnings (non-noun +1 words — prefer nouns):`);
  for (const w of baseWordWarnings) console.log(`        ⚠ ${w}`);
} else {
  console.log(`Base words: no known non-noun base words found.`);
}
if (failingSets.length) {
  console.log(`Sets failing the containment rule: ${failingSets.join(", ")}`);
  process.exitCode = 1;
}
