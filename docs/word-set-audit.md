# Word-set audit

Audit of the eight word sets against
[`word-set-guidelines.md`](./word-set-guidelines.md). Containment numbers are
from `npx tsx scripts/audit-word-sets.mts`; the "well-known" judgements are by
inspection.

## Summary

| Set | Cards | Contains easy (Rule 2) | Well-known / not-nonsense (Rules 3–4) | Verdict |
|---|---:|---:|---|---|
| Standard | 2509 | **100%** | Good — real compounds | ✅ Keep |
| Fantasy | 2409 | 100% | **Bad** — cross-product artefacts | ❌ Rebuild |
| Movies | 154 | **18.8%** | Titles are famous | ❌ Rebuild (containment) |
| Munchies | 1041 | 97.9% | Mixed — cross artefacts | ⚠️ Trim |
| Down Under | 54 | 81.5% | Good phrases | ⚠️ Fix 10 |
| Sunny Singapore | 122 | **53.3%** | Authentic but foreign words | ❌ Rebuild (containment) |
| Songs | 116 | **43.1%** | Titles are famous | ❌ Rebuild (containment) |
| Animals | 1312 | 99.9% | **Half bad** — descriptor cross | ⚠️ Trim to table |

Overall containment (96.3%) is **misleading**: it's propped up by the three
huge generated sets. The curated themed sets fail badly.

## Two systemic failure modes

Both come from the earlier "≥1000 cards per set" push, which the new "quality
over size" rule reverses.

### A. Containment failures (Rule 2) — Movies, Songs, Singapore, Down Under

These sets were designed with `easy` as a **hint** word that isn't in the
phrase, e.g.:

- `Music` → `A Star Is Born`
- `Heart` → `Shape Of You`
- `Noodle` → `Laksa`
- `Snag` → `Sausage Sizzle`

Under the new Rule 2 the easy word must appear in the phrase, so this whole
design is invalid. Movies (18.8%) and Songs (43.1%) are the worst — a title
like `Frozen` simply has no word to anchor to.

### B. Nonsense / not-well-known (Rules 3–4) — Fantasy, Animals, Munchies

These pass containment (the noun is in the phrase) but were built by
**cross-product**, so many cards are grammatical noise:

- Fantasy: `Dwarven Dragon`, `Poison Angel`, `Blessed Sword`, `Runed Axe`
- Animals: `Dancing Seahorse`, `Grumpy Cobra`, `Spotted Otter` (literally the
  "dancing cats" anti-example)
- Munchies: `Sour Rice`, `Creamy Corn`, `Fizzy Milk`, `Sweet Cabbage`

## Per-set findings & recommended fix

**Standard — ✅ keep.** 100% containment, phrases are real compounds
(`Camp Fire`, `Sea Horse`). The model set. Optional: spot-check for a few weak
compounds, but no action needed.

**Fantasy — ❌ rebuild small.** Drop the `cross(ADJ, NOUN)` generator entirely.
Replace with a curated table of genuine fantasy compounds where the noun is in
the phrase: `Dragon → Dragon Fire / Dragon Slayer / Dragon Egg`, `Spell → Spell
Book`, `Fire → Fire Ball`. Expect ~150–300 good cards.

**Movies — ❌ rebuild around containment.** Keep only titles that contain a
simple word, and set `easy` to that word: `Toy → Toy Story`, `Lion → The Lion
King`, `Star → A Star Is Born`, `Spider → Spider Man`, `Ring → Lord Of The
Rings`. Drop one-word titles (`Frozen`, `Up`, `Shrek`) and titles with no
extractable word. Smaller, but every card is valid.

**Munchies — ⚠️ trim.** Remove the flavour/style/drink cross artefacts
(`Sour Rice`, `Creamy Corn`, `Fizzy Milk`). Keep the real-dish table
(`Fish Cake`, `Egg Roll`, `Fried Rice`, `Spring Roll`). For ethnic dishes that
fail containment (`Pad Thai`, `Butter Chicken`), either re-anchor to a word
that's present (`Thai → Pad Thai`) or drop.

**Down Under — ⚠️ fix 10.** Re-anchor the non-containing cards to a word that's
actually in the phrase: `Roo → Boxing Kangaroo` should be `Kangaroo → Boxing
Kangaroo`; `Snag → Sausage Sizzle` → `Sausage → Sausage Sizzle`; drop
`Bang → Wooden Boomerang` and `Bush → The Outback`.

**Sunny Singapore — ❌ rebuild around containment.** 57/122 fail because local
dishes are single foreign words (`Laksa`, `Satay`, `Kopi`) with no English
anchor. Keep the ones that work (`Rice → Chicken Rice`, `Crab → Chilli Crab`,
`Bay → Marina Bay`) and drop the rest, or accept this set stays small.

**Songs — ❌ rebuild around containment.** Same as Movies: keep titles with a
usable inside word (`Shark → Baby Shark`, `Wall → Wonderwall`, `Fire →
Firework`, `Star → Counting Stars`) and drop the rest (39 are one-word titles).

**Animals — ⚠️ trim to the table.** The curated idiom table is great
(`Downward Dog`, `Night Owl`, `Cash Cow`, `Bull Market`). **Delete the
`DESCRIPTOR × ANIMALS` cross** — every `Dancing Seahorse` / `Grumpy Cobra`
comes from there. Leaves ~350 solid cards.

## Recommended next step

Enforce Rule 2 in code and re-curate. Concretely:

1. Delete `cross()` usage from `fantasy.ts`, `munchies.ts`, `animals.ts`.
2. Re-anchor or drop every containment failure the audit lists.
3. Rebuild Movies/Songs/Singapore as small, valid, well-known sets.
4. Wire `npx tsx scripts/audit-word-sets.mts` into CI (or a pre-commit hook) so
   containment can never regress.

This trades the current ~7,700 cards for a smaller, higher-quality deck — which
is exactly what Rule 1 (no minimum, optimise for quality) asks for.
