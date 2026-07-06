import type { WordCard } from "./types";
import { EVERYDAY_CARDS } from "./everyday";
import { FANTASY_CARDS } from "./fantasy";
import { MOVIE_CARDS } from "./movies";
import { MUNCHIES_CARDS } from "./munchies";
import { DOWN_UNDER_CARDS } from "./downunder";
import { SINGAPORE_CARDS } from "./singapore";
import { SONG_CARDS } from "./songs";
import { ANIMAL_CARDS } from "./animals";

export type WordSet = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  cards: WordCard[];
};

// In Poetry for Neanderthals the "caveman" twist is the *mechanic* — you may
// only clue using single-syllable words — not the cards. Each card has a simple
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
    blurb: "Famous films from the 90s on",
    cards: MOVIE_CARDS,
  },
  {
    id: "munchies",
    name: "Munchies",
    emoji: "🍜",
    blurb: "Food, drink and tasty treats",
    cards: MUNCHIES_CARDS,
  },
  {
    id: "down-under",
    name: "Down Under",
    emoji: "🦘",
    blurb: "Roos, servo snacks and the outback",
    cards: DOWN_UNDER_CARDS,
  },
  {
    id: "singapore",
    name: "Sunny Singapore",
    emoji: "🦁",
    blurb: "Hawker food, lah, and local icons",
    cards: SINGAPORE_CARDS,
  },
  {
    id: "songs",
    name: "Songs",
    emoji: "🎵",
    blurb: "Hit songs from the 90s on",
    cards: SONG_CARDS,
  },
  {
    id: "animals",
    name: "Animals",
    emoji: "🐾",
    blurb: "An animal + a phrase it lives in",
    cards: ANIMAL_CARDS,
  },
];

export function wordSetById(id: string): WordSet {
  return WORD_SETS.find((s) => s.id === id) ?? WORD_SETS[0];
}
