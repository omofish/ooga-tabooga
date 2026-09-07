# Word-set guidelines

How to write and review the word sets in `lib/word-sets/` (`everyday.ts`,
`fantasy.ts`, `movies.ts`, `tv-shows.ts`, `munchies.ts`, `singapore.ts`,
`animals.ts`, `bible.ts`). These rules exist so every card plays cleanly in a
party game where clues can only use one-syllable words.

## The card model

Each card is one `WordCard`:

```ts
{ easy: "Fire", hard: "Camp Fire" }
```

- **`easy`** — the **1-point** word. Simple, guessable on its own, and ideally a
  **concrete noun** (see Rule 6).
- **`hard`** — the **3-point** phrase. A harder, more specific answer.

During a turn the clue giver tries for the 3-pointer; the 1-pointer is the fallback.

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

Those repeats are a **variety pool, not repetition in play**: a single game
deals **at most one card per base word** (see Rule 7), so listing five `Fire`
phrases doesn't mean players see "Fire" five times in one game — it means a
different `Fire` phrase can surface across different games.

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
clue giver who gets teammates to "Camp ___" after they've said "Fire" has a clean path
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
a loop. Cross-product generators are therefore **banned**; `fromTable()` in
`lib/word-sets/gen.ts` (curated `[easy, [hard, …]]` lists) is fine because a
person picks each phrase.

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
- For themed name sets (e.g. Movies), the title must be genuinely famous **and**
  contain the easy word (Rule 2). If a famous title has no simple word to pull
  out (`Frozen`, `Titanic`), it can't be a card — that's fine, leave it out.

When in doubt, cut. There is always another strong phrase to add instead.

### 5. The 3-point phrase must be two distinct, real words

`hard` has to read as **two separate words that each stand on their own** and
keep their own meaning. The phrase is played two words at a time — the clue giver
clues one half, then the other — so both halves have to be real, cluable words.
Cut a phrase if:

- **a half isn't a real word** — `Yester Day`, `Uni Corn`, `Cran Berry`,
  `Lemon Ade`, `Nut Meg`, `Holi Day` (there is no "yester", "uni", "cran",
  "ade", "meg", "holi"); or
- **it's really one word wearing a space** — a fused compound whose halves have
  lost their meaning, so reading them apart does *not* rebuild the phrase:
  `Net Work` (a network isn't "work"), `Cup Board` (a cupboard isn't a "board"),
  `Under Stand`, `Over Come`. Say the two halves out loud: if a fluent speaker
  wouldn't reassemble the phrase from them, cut it.

| ✅ Two real words that combine | ❌ Fake split / fused word |
|---|---|
| `Camp Fire` (a fire at a camp) | `Net Work` (network ≠ net + work) |
| `Sea Horse` (horse of the sea) | `Yester Day` ("yester" isn't a word) |
| `Night Owl` (owl of the night) | `Cup Board` ("cubberd", not cup + board) |

Transparent noun+noun compounds like `Water Melon`, `Straw Berry` and
`Pine Apple` are fine — each half is a real word you can say aloud. This is a
judgement call (like Rules 3–4) and is only partly auto-checked; the audit
flags the common non-word fragments but the "fused word" cases need a human eye.

### 6. The 1-point base word should be a noun

Strongly prefer **concrete nouns** for `easy`. The base word is the fallback a
clue giver falls back to under time pressure, and nouns are the easiest thing to
get a team to shout. Function words make miserable clues — `Over`, `Up`, `Out`,
`Under`, `Down` are impossible to act out or hint at with one-syllable words, so
a card built on them just stalls.

- ✅ nouns: `Fire`, `Dog`, `Rice`, `Star`, `Bear`.
- ❌ prepositions / particles / adverbs / pronouns: `Over`, `Up`, `Out`,
  `Under`, `Down`, `Off`, `Very`, `Just`.
- ⚠️ verbs and bare adjectives are weaker too (`Run`, `Old`) — allowed only when
  the word is also a strong, guessable thing in its own right (colours like
  `Red`/`White` are fine); otherwise pick a noun anchor instead.

The audit warns on base words that are known function words (the ❌ list); the
verb/adjective cases are a judgement call and need a human eye.

### 7. A base word never repeats within a game

Even though a set may list many phrases under one anchor (Rule 1), the deck
builder (`buildDeck` in `lib/game.ts`) keeps **only the first card it reaches
for each base word**, so a game's deck holds one card per base word. A base word
therefore **never repeats until every base word has been dealt once**; only then
does `drawAt` reshuffle for a fresh cycle (never dealing the same base twice
back-to-back). Unseen cards are preferred, so which phrase represents a base word
can differ game to game. Two consequences for authoring:

- Repeats under one anchor are good — they widen the pool the game draws from
  across sessions — but they do **not** grow a single game's deck.
- A set's real per-game size is its count of **distinct base words**, which the
  audit prints as `unique-base`. Keep that healthy, not just the raw card count —
  a bigger `unique-base` is how long a game goes before any +1 word can recur.

## Writing a set

1. Pick a theme and brainstorm **easy anchor words** — concrete nouns (Fire,
   Dog, Rice…); avoid function words (Rule 6).
2. For each anchor, list only the `hard` phrases you're confident are **real
   and well-known and contain the anchor**. Stop when you run dry — don't reach.
3. Put them in a `[easy, [hard, …]]` table and expand with `fromTable()`.
4. `build()` (which `fromTable()` calls) drops duplicate `hard` phrases,
   self-references, and any card that fails containment (Rule 2).
5. Run the audit; fix or delete every containment failure and review the
   base-word and Rule 5 warnings.

Themed name sets (e.g. Movies) are the exception to the table shape: they're
flat `[easy, hard]` lists where `easy` is a word **taken from** the title
(`Toy` → `Toy Story`, `Star` → `A Star Is Born`).

## Automated audit

```bash
npx tsx scripts/audit-word-sets.mts
```

Reports, per set: how many cards satisfy Rule 2 (containment) and lists the
failures, and the `unique-base` count (distinct base words = the real per-game
deck size, Rule 7). It exits non-zero if any set has a containment violation. As
**warnings** (never failures) it also flags any `hard` whose other half is a
known non-word fragment (Rule 5, e.g. `Yester Day`, `Uni Corn`) and any base
word that is a known function word (Rule 6, e.g. `Over`, `Up`). Rules 3 and 4
(well-known / not-nonsense), the verb/adjective half of Rule 6, and the "fused
word" half of Rule 5 are judgement calls and are **not** auto-checked — review
those by reading the cards.

## Per-set intent

| Set | Theme | Notes |
|---|---|---|
| Standard | everyday compounds | The workhorse. Compounds like `Camp Fire`. |
| Fantasy | magic, dragons, medieval | Real fantasy compounds only (`Dragon Fire`, `Magic Spell`). |
| Movies | famous films, 90s→ | `easy` is a word inside the title. |
| TV Shows | famous series, old sitcoms→ | Same shape as Movies — `easy` is a word inside the title. |
| Munchies | food & drink | Real dishes; ethnic dishes welcome, no local slang venues. |
| Sunny Singapore | Singapore | Local food/places/slang; `easy` must appear in them. |
| Animals | animal idioms | `easy` is an animal; `hard` a real phrase it's in (`Night Owl`). |
