import type { WordCard } from "./types";

export type WordSet = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  cards: WordCard[];
};

// Original word pairs (not from the retail game). Each card has an easy
// one-point word and a harder three-point phrase.

const CAVE_LIFE: WordCard[] = [
  { easy: "Fire", hard: "Roasted mammoth leg" },
  { easy: "Rock", hard: "Sharp throwing stone" },
  { easy: "Cave", hard: "Cozy family cave" },
  { easy: "Club", hard: "Big wooden club" },
  { easy: "Bone", hard: "Broken rib bone" },
  { easy: "Meat", hard: "Chewy dried meat" },
  { easy: "Spear", hard: "Long pointy spear" },
  { easy: "Fur", hard: "Warm bear fur coat" },
  { easy: "Mud", hard: "Sticky river mud" },
  { easy: "Fish", hard: "Slippery little fish" },
  { easy: "Wheel", hard: "First round wheel" },
  { easy: "Star", hard: "Bright night star" },
  { easy: "Moon", hard: "Big full moon" },
  { easy: "Sun", hard: "Hot morning sun" },
  { easy: "Tooth", hard: "Loose front tooth" },
  { easy: "Berry", hard: "Sweet red berry" },
  { easy: "Nut", hard: "Hard cracked nut" },
  { easy: "Root", hard: "Deep tree root" },
  { easy: "Leaf", hard: "Big green leaf" },
  { easy: "Vine", hard: "Long swinging vine" },
  { easy: "Drum", hard: "Loud skin drum" },
  { easy: "Paint", hard: "Red cave paint" },
  { easy: "Trap", hard: "Deep hidden trap" },
  { easy: "Hut", hard: "Small grass hut" },
  { easy: "Torch", hard: "Bright burning torch" },
  { easy: "Snow", hard: "Cold white snow" },
  { easy: "Rain", hard: "Heavy loud rain" },
  { easy: "Egg", hard: "Giant bird egg" },
  { easy: "Horn", hard: "Curved goat horn" },
  { easy: "Wolf", hard: "Hungry grey wolf" },
  { easy: "Hill", hard: "Steep rocky hill" },
  { easy: "Nap", hard: "Long afternoon nap" },
  { easy: "Bug", hard: "Crunchy roasted bug" },
  { easy: "Skull", hard: "Old cracked skull" },
  { easy: "Knot", hard: "Tight rope knot" },
  { easy: "Boat", hard: "Leaky log boat" },
];

const WILD_WORLD: WordCard[] = [
  { easy: "Bear", hard: "Angry brown bear" },
  { easy: "Deer", hard: "Fast jumping deer" },
  { easy: "Bird", hard: "Bright singing bird" },
  { easy: "Snake", hard: "Long green snake" },
  { easy: "Frog", hard: "Jumpy pond frog" },
  { easy: "Bee", hard: "Busy buzzing bee" },
  { easy: "Ant", hard: "Tiny black ant" },
  { easy: "Owl", hard: "Wise night owl" },
  { easy: "Bat", hard: "Cave hanging bat" },
  { easy: "Crab", hard: "Snappy beach crab" },
  { easy: "Shark", hard: "Big toothy shark" },
  { easy: "Whale", hard: "Huge blue whale" },
  { easy: "Goat", hard: "Grumpy mountain goat" },
  { easy: "Pig", hard: "Muddy fat pig" },
  { easy: "Horse", hard: "Wild running horse" },
  { easy: "Mouse", hard: "Quick grey mouse" },
  { easy: "Fox", hard: "Sneaky red fox" },
  { easy: "Duck", hard: "Loud wet duck" },
  { easy: "Cat", hard: "Big cave cat" },
  { easy: "Worm", hard: "Slow wiggly worm" },
  { easy: "Moth", hard: "Dusty night moth" },
  { easy: "Toad", hard: "Warty fat toad" },
  { easy: "Seal", hard: "Slippery grey seal" },
  { easy: "Elk", hard: "Tall antler elk" },
  { easy: "Hawk", hard: "Sharp diving hawk" },
  { easy: "Slug", hard: "Slimy garden slug" },
  { easy: "Clam", hard: "Shut up clam" },
  { easy: "Newt", hard: "Small spotted newt" },
  { easy: "Wasp", hard: "Mean stinging wasp" },
  { easy: "Mole", hard: "Blind digging mole" },
  { easy: "Fern", hard: "Tall shady fern" },
  { easy: "Moss", hard: "Soft damp moss" },
  { easy: "Reed", hard: "Thin river reed" },
  { easy: "Cloud", hard: "Dark storm cloud" },
  { easy: "Wave", hard: "Tall crashing wave" },
  { easy: "Cliff", hard: "Steep sea cliff" },
];

const WEIRD_FUTURE: WordCard[] = [
  { easy: "Phone", hard: "Glowing hand rock" },
  { easy: "Car", hard: "Fast metal box" },
  { easy: "Bike", hard: "Two wheel horse" },
  { easy: "Plane", hard: "Loud sky bird" },
  { easy: "Boot", hard: "Warm foot bag" },
  { easy: "Cup", hard: "Small drink bowl" },
  { easy: "Fork", hard: "Tiny food spear" },
  { easy: "Soap", hard: "Slippy clean rock" },
  { easy: "Clock", hard: "Round time face" },
  { easy: "Ball", hard: "Round bouncy toy" },
  { easy: "Kite", hard: "String sky toy" },
  { easy: "Book", hard: "Flat word stack" },
  { easy: "Chair", hard: "Wood sit thing" },
  { easy: "Bed", hard: "Soft sleep box" },
  { easy: "Door", hard: "Wall swing flap" },
  { easy: "Broom", hard: "Long dust stick" },
  { easy: "Hat", hard: "Round head roof" },
  { easy: "Shoe", hard: "Tight foot boat" },
  { easy: "Ring", hard: "Round shiny band" },
  { easy: "Key", hard: "Small lock tooth" },
  { easy: "Map", hard: "Flat road ghost" },
  { easy: "Bag", hard: "Big cloth pouch" },
  { easy: "Pen", hard: "Thin ink stick" },
  { easy: "Sock", hard: "Soft toe sack" },
  { easy: "Lamp", hard: "Tame fire jar" },
  { easy: "Glass", hard: "See through wall" },
  { easy: "Cake", hard: "Sweet round bread" },
  { easy: "Straw", hard: "Thin drink tube" },
  { easy: "Fan", hard: "Fast spin wind" },
  { easy: "Rope", hard: "Long twist string" },
  { easy: "Coat", hard: "Long warm skin" },
  { easy: "Nail", hard: "Small sharp spike" },
  { easy: "Belt", hard: "Tight waist snake" },
  { easy: "Comb", hard: "Small hair rake" },
  { easy: "Cart", hard: "Roll box wagon" },
  { easy: "Net", hard: "Wide fish web" },
];

export const WORD_SETS: WordSet[] = [
  {
    id: "cave-life",
    name: "Cave Life",
    emoji: "🪨",
    blurb: "Rocks, bones and roasted meat",
    cards: CAVE_LIFE,
  },
  {
    id: "wild-world",
    name: "Wild World",
    emoji: "🐾",
    blurb: "Beasts, bugs and the great outdoors",
    cards: WILD_WORLD,
  },
  {
    id: "weird-future",
    name: "Weird Future",
    emoji: "✨",
    blurb: "Strange things from a far off age",
    cards: WEIRD_FUTURE,
  },
];

export function wordSetById(id: string): WordSet {
  return WORD_SETS.find((s) => s.id === id) ?? WORD_SETS[0];
}
