// Funny tribe-name suggestions used by the 🎲 randomiser in the tribe-naming
// menu. Each name ships with a matching emoji so a random roll drops in a name
// *and* an on-theme emoji together. Duplicates across teams are fine — this is
// just a playful default the players can edit.

export type TribeSuggestion = { name: string; emoji: string };

export const TRIBE_NAMES: TribeSuggestion[] = [
  { name: "Rock Munchers", emoji: "🪨" },
  { name: "Tusk Force", emoji: "🦣" },
  { name: "Bonk Brigade", emoji: "🔨" },
  { name: "Fire Starters", emoji: "🔥" },
  { name: "Bone Crushers", emoji: "🦴" },
  { name: "Club Wielders", emoji: "🪵" },
  { name: "Grunt Squad", emoji: "😤" },
  { name: "Cave Bats", emoji: "🦇" },
  { name: "Woolly Wonders", emoji: "🐘" },
  { name: "Sabre Squad", emoji: "🐯" },
  { name: "Meat Sweats", emoji: "🍖" },
  { name: "Boulder Bros", emoji: "🪨" },
  { name: "Coconut Bonkers", emoji: "🥥" },
  { name: "Volcano Vandals", emoji: "🌋" },
  { name: "Mud Monkeys", emoji: "🐒" },
  { name: "Banana Bandits", emoji: "🍌" },
  { name: "Mushroom Munchers", emoji: "🍄" },
  { name: "Wild Boars", emoji: "🐗" },
  { name: "Ice Age Icons", emoji: "🧊" },
  { name: "Sun Worshippers", emoji: "☀️" },
  { name: "Moon Howlers", emoji: "🐺" },
  { name: "Swamp Things", emoji: "🐸" },
  { name: "Dino Dodgers", emoji: "🦖" },
  { name: "Honey Badgers", emoji: "🦡" },
  { name: "Flint Flingers", emoji: "⚡" },
  { name: "Berry Snatchers", emoji: "🫐" },
  { name: "Cactus Crew", emoji: "🌵" },
  { name: "Star Gazers", emoji: "✨" },
  { name: "Furry Fury", emoji: "🐾" },
  { name: "Pebble People", emoji: "🪨" },
];

export function randomTribe(): TribeSuggestion {
  return TRIBE_NAMES[Math.floor(Math.random() * TRIBE_NAMES.length)];
}
