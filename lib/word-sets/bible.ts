import type { WordCard } from "../types";
import { build } from "./gen";

// Bible: the hard 3-point answer is a famous Bible term, place, or character
// pairing, kept to 2-3 words. The easy 1-point word is a word taken *from*
// that phrase, so it satisfies containment (Rule 2) — mirrors the Movies
// set's approach for named/titled content.
export const BIBLE_CARDS: WordCard[] = build([
  { easy: "Ark", hard: "Noah's Ark" },
  { easy: "Calf", hard: "Golden Calf" },
  { easy: "Eve", hard: "Adam And Eve" },
  { easy: "Goliath", hard: "David And Goliath" },
  { easy: "David", hard: "King David" },
  { easy: "Solomon", hard: "King Solomon" },
  { easy: "Eden", hard: "Garden Of Eden" },
  { easy: "Babel", hard: "Tower Of Babel" },
  { easy: "Commandments", hard: "Ten Commandments" },
  { easy: "Samaritan", hard: "Good Samaritan" },
  { easy: "Mount", hard: "Mount Sinai" },
  { easy: "Supper", hard: "The Last Supper" },
  { easy: "Judas", hard: "Judas Iscariot" },
  { easy: "Christ", hard: "Jesus Christ" },
  { easy: "John", hard: "John The Baptist" },
  { easy: "Abel", hard: "Cain And Abel" },
  { easy: "Rib", hard: "Adam's Rib" },
  { easy: "Fruit", hard: "Forbidden Fruit" },
  { easy: "Loaves", hard: "Loaves And Fishes" },
  { easy: "Sea", hard: "Red Sea" },
  { easy: "Star", hard: "Star Of Bethlehem" },
  { easy: "Men", hard: "Three Wise Men" },
  { easy: "Son", hard: "Prodigal Son" },
  { easy: "Shepherd", hard: "Good Shepherd" },
  { easy: "Land", hard: "Promised Land" },
  { easy: "Salt", hard: "Pillar Of Salt" },
  { easy: "Queen", hard: "Queen Of Sheba" },
  { easy: "Bush", hard: "Burning Bush" },
  { easy: "Samson", hard: "Samson And Delilah" },
  { easy: "Mary", hard: "Virgin Mary" },
]);
