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

/**
 * Pick `n` distinct tribe suggestions from the pool (name + emoji). Used to seed
 * a new game's default tribes with fresh random names instead of always the same
 * fixed defaults. Falls back to allowing repeats only if `n` exceeds the pool.
 */
export function randomTribes(n: number): TribeSuggestion[] {
  const pool = [...TRIBE_NAMES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (n <= pool.length) return pool.slice(0, n);
  return Array.from({ length: n }, (_, i) => pool[i % pool.length]);
}
