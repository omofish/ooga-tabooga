import type { WordSet } from "../types";
import { EVERYDAY_CARDS } from "./everyday";
import { FANTASY_CARDS } from "./fantasy";
import { MOVIE_CARDS } from "./movies";
import { TV_SHOW_CARDS } from "./tv-shows";
import { MUNCHIES_CARDS } from "./munchies";
import { SINGAPORE_CARDS } from "./singapore";
import { ANIMAL_CARDS } from "./animals";
import { BIBLE_CARDS } from "./bible";

// The "caveman" twist is the *mechanic* — you may only clue using
// single-syllable words — not the cards. Each card has a simple
// one-point word and a harder three-point term. Ordering here is the order
// shown on the setup screen.

export const WORD_SETS: WordSet[] = [
  {
    id: "standard",
    name: "Standard",
    emoji: "🎯",
    blurb: "A huge mix of everyday words",
    cards: EVERYDAY_CARDS,
  },
  {
    id: "fantasy",
    name: "Fantasy",
    emoji: "🐉",
    blurb: "Magic, dragons, elves & knights",
    cards: FANTASY_CARDS,
  },
  {
    id: "movies",
    name: "Movies",
    emoji: "🎬",
    blurb: "Famous films across the decades",
    cards: MOVIE_CARDS,
  },
  {
    id: "tv-shows",
    name: "TV Shows",
    emoji: "📺",
    blurb: "Famous series, old sitcoms to modern hits",
    cards: TV_SHOW_CARDS,
  },
  {
    id: "munchies",
    name: "Munchies",
    emoji: "🍔",
    blurb: "Food, drink and tasty treats",
    cards: MUNCHIES_CARDS,
  },
  {
    id: "singapore",
    name: "Sunny Singapore",
    emoji: "🦁",
    blurb: "Hawker food, lah, and local icons",
    cards: SINGAPORE_CARDS,
  },
  {
    id: "animals",
    name: "Animals",
    emoji: "🐕",
    blurb: "An animal + a phrase it lives in",
    cards: ANIMAL_CARDS,
  },
  {
    id: "bible",
    name: "Bible",
    emoji: "📖",
    blurb: "Famous terms, places & characters",
    cards: BIBLE_CARDS,
  },
];

export function wordSetById(id: string): WordSet {
  return WORD_SETS.find((s) => s.id === id) ?? WORD_SETS[0];
}
