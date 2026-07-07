# Word-set guidelines

How to write and review the word sets in `lib/` (`everyday.ts`, `fantasy.ts`,
`movies.ts`, `munchies.ts`, `downunder.ts`, `singapore.ts`, `songs.ts`,
`animals.ts`). These rules exist so every card plays cleanly in a party game
where clues can only use one-syllable words.

## The card model

Each card is one `WordCard`:

```ts
{ easy: "Fire", hard: "Camp Fire" }
```

- **`easy`** — the **1-point** word. Simple, guessable on its own.
- **`hard`** — the **3-point** phrase. A harder, more specific answer.

During a turn the poet tries for the 3-pointer; the 1-pointer is the fallback.

## The rules

### 1. No minimum size — optimise for quality

There is **no target card count**. A tight set of 150 great cards beats 1,500
padded ones. Never add cards just to hit a number, and never generate filler by
brute force. Delete a card if you're not sure it's good.

**Easy words may repeat within a set.** The same 1-point word can anchor many
cards — `Fire → Fire Hose` and `Fire → Wild Fire` are both welcome. This is the
main way to keep quantity up while holding a high bar: rather than reach for a
weak phrase, add another strong phrase under a word you already use. Only the
`hard` phrase must be unique across the set; the `easy` word need not be.

### 2. The 3-point phrase MUST contain the 1-point word

`hard` must contain `easy` as a **whole word** (case-insensitive). A simple
inflection of the same root (plural/possessive) is acceptable.

| ✅ Good | ❌ Bad |
|---|---|
| `Fire` → `Camp Fire` | `Snow` → `Frozen` (word absent) |
| `Rice` → `Chicken Rice` | `Noodle` → `Laksa` (word absent) |
| `Dog` → `Downward Dog` | `Heart` → `Shape Of You` (word absent) |

This is the one rule a machine can check — see [the audit](#automated-audit).
It exists so the 1-point fallback is always *inside* the 3-point answer: the
poet who gets teammates to "Camp ___" after they've said "Fire" has a clean path
to the bonus. If the easy word isn't in the phrase, the two are unrelated and
the card feels broken.

### 3. No forced/nonsense phrases — it must be a real association

`hard` has to be a phrase people **actually say** — a compound word, a set
phrase, an idiom, a common dish, a title. Do **not** stitch a random
modifier onto a noun.

| ✅ Good (established) | ❌ Nonsense (invented) |
|---|---|
| `Cat` → `Copy Cat` | `Cat` → `Dancing Cat` |
| `Dragon` → `Dragon Fire` | `Dragon` → `Dwarven Dragon` |
| `Rice` → `Fried Rice` | `Rice` → `Sour Rice` |
| `Seahorse` → (skip) | `Seahorse` → `Dancing Seahorse` |

**Corollary — do not generate sets by cross-product.** Multiplying an
adjective list by a noun list ("Ancient/Cursed/Frost × Dragon/Sword/Angel")
produces grammatical but meaningless combinations and directly violates this
rule. Every card should be chosen by a human (or checked by one), not emitted by
a loop. The `cross()` helper in `lib/gen.ts` is therefore **banned** for new
work; `fromTable()` (curated `[easy, [hard, …]]` lists) is fine because a person
picks each phrase.

### 4. Phrases must be well known — cut anything even 10% a stretch

Aim high. A card only earns its place if a typical adult would recognise the
phrase **instantly**. The test: if you suspect **even ~10%** that a phrase is a
stretch — obscure, technical, archaic, awkwardly split, or "technically a word
but rarely said" — **cut it**. Quality beats quantity every time, and Rule 1's
easy-word duplication lets you refill the count with strong phrases instead.

- ✅ `Meat Pie`, `Hot Dog`, `Night Owl`, `Camp Fire`, `The Lion King`
- ❌ Cut jargon / technical: `Grace Note`, `Under Score`, `Sine Wave`,
  `Tectonic Plate`, `Cotter Pin`.
- ❌ Cut niche / obscure: `Salt Lick`, `Rock Pool`, `Sally Port`, `Coal Scuttle`,
  `Nut Hatch`, `Dew Claw`.
- ❌ Cut awkward splits of a single word: `Frost Ing`, `Ham String`, `Over Alls`.
- For themed name sets (Movies/Songs), the title must be genuinely famous **and**
  contain the easy word (Rule 2). If a famous title has no simple word to pull
  out (`Frozen`, `Titanic`), it can't be a card — that's fine, leave it out.

When in doubt, cut. There is always another strong phrase to add instead.

## Writing a set

1. Pick a theme and brainstorm **easy anchor words** (Fire, Dog, Rice…).
2. For each anchor, list only the `hard` phrases you're confident are **real
   and well-known and contain the anchor**. Stop when you run dry — don't reach.
3. Put them in a `[easy, [hard, …]]` table and expand with `fromTable()`.
4. `dedupe()` removes duplicate `hard` phrases and self-references.
5. Run the audit; fix or delete every containment failure.

Themed name sets (Movies, Songs) are the exception to the table shape: they're
flat `[easy, hard]` lists where `easy` is a word **taken from** the title
(`Toy` → `Toy Story`, `Star` → `A Star Is Born`).

## Automated audit

```bash
npx tsx scripts/audit-word-sets.mts
```

Reports, per set, how many cards satisfy Rule 2 (containment) and lists the
failures. It exits non-zero if any set has a containment violation. Rules 3 and
4 (well-known / not-nonsense) are judgement calls and are **not** auto-checked —
review those by reading the cards.

## Per-set intent

| Set | Theme | Notes |
|---|---|---|
| Standard | everyday compounds | The workhorse. Compounds like `Camp Fire`. |
| Fantasy | magic, dragons, medieval | Real fantasy compounds only (`Dragon Fire`, `Magic Spell`). |
| Movies | famous films, 90s→ | `easy` is a word inside the title. |
| Munchies | food & drink | Real dishes; ethnic dishes welcome, no local slang venues. |
| Down Under | Australia | Aussie phrases; `easy` must appear in them. |
| Sunny Singapore | Singapore | Local food/places/slang; `easy` must appear in them. |
| Songs | famous songs, 90s→ | `easy` is a word inside the title. |
| Animals | animal idioms | `easy` is an animal; `hard` a real phrase it's in (`Night Owl`). |
