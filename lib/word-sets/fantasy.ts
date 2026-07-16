import type { WordCard } from "../types";
import { fromTable } from "./gen";

// Fantasy: magic, dragons, elves, medieval. Curated real phrases only — each
// hard phrase is an established compound/name that contains the easy word.

const TABLE: [string, string[]][] = [
  ["Dragon", ["Dragon Fire", "Dragon Egg", "Dragon Slayer", "Dragon Rider", "Dragon Scale", "Dragon Lord", "Baby Dragon", "Sea Dragon"]],
  ["Sword", ["Magic Sword", "Broad Sword", "Long Sword", "Sword Fight", "Sword Master", "Flaming Sword", "Great Sword", "Sword Play"]],
  ["Spell", ["Spell Book", "Magic Spell", "Fire Spell", "Ice Spell", "Sleeping Spell", "Counter Spell", "Death Spell"]],
  ["Wizard", ["Wizard Hat", "Wizard Tower", "Wizard Staff", "Grand Wizard", "Battle Wizard"]],
  ["Witch", ["Witch Hat", "Witch Craft", "Sea Witch", "Snow Witch", "Witch Hunt", "Wicked Witch", "Witch Doctor"]],
  ["Knight", ["Dark Knight", "White Knight", "Black Knight", "Knight Errant", "Knight Rider"]],
  ["Castle", ["Castle Gate", "Castle Wall", "Sand Castle", "Castle Keep", "Castle Moat", "Haunted Castle"]],
  ["Magic", ["Black Magic", "White Magic", "Magic Carpet", "Magic Mirror", "Magic Wand", "Magic Ring", "Magic Bean", "Dark Magic", "Magic Trick", "Magic Potion"]],
  ["Fire", ["Dragon Fire", "Wild Fire", "Hell Fire", "Fire Ball", "Fire Storm", "Camp Fire", "Fire Breath"]],
  ["Ice", ["Ice Queen", "Ice Spell", "Ice Storm", "Ice Wall", "Black Ice", "Ice Giant"]],
  ["King", ["Goblin King", "Lich King", "Sorcerer King", "Warrior King", "Boy King", "King Cobra"]],
  ["Queen", ["Ice Queen", "Snow Queen", "Fairy Queen", "Warrior Queen", "Evil Queen", "Red Queen"]],
  ["Elf", ["Wood Elf", "High Elf", "Night Elf", "Dark Elf", "Elf King", "Elf Lord"]],
  ["Giant", ["Frost Giant", "Fire Giant", "Stone Giant", "Cloud Giant", "Hill Giant", "Gentle Giant"]],
  ["Troll", ["Cave Troll", "Bridge Troll", "Mountain Troll", "Troll King"]],
  ["Goblin", ["Goblin King", "Goblin Horde", "Cave Goblin", "Hob Goblin", "Goblin Market"]],
  ["Beast", ["Fell Beast", "Sea Beast", "Wild Beast", "Shadow Beast", "Beast Master"]],
  ["Wolf", ["Were Wolf", "Dire Wolf", "Wolf Pack", "Sea Wolf", "Wolf Man"]],
  ["Crown", ["Iron Crown", "Golden Crown", "Broken Crown", "Royal Crown", "Crown Jewel"]],
  ["Ring", ["Magic Ring", "Gold Ring", "Ring Bearer", "Signet Ring"]],
  ["Staff", ["Magic Staff", "Wizard Staff", "Battle Staff", "Wooden Staff"]],
  ["Shield", ["Magic Shield", "Battle Shield", "Iron Shield", "Shield Wall", "Shield Maiden"]],
  ["Potion", ["Magic Potion", "Healing Potion", "Love Potion", "Poison Potion", "Potion Bottle"]],
  ["Rune", ["Rune Stone", "Rune Sword", "Magic Rune", "Rune Master", "Blood Rune"]],
  ["Cave", ["Dragon Cave", "Cave Troll", "Bat Cave", "Cave Man", "Dark Cave"]],
  ["Forest", ["Dark Forest", "Enchanted Forest", "Haunted Forest", "Elven Forest", "Forest Spirit"]],
  ["Tower", ["Wizard Tower", "Dark Tower", "Bell Tower", "Watch Tower", "Ivory Tower", "Clock Tower"]],
  ["Curse", ["Ancient Curse", "Dark Curse", "Blood Curse", "Family Curse"]],
  ["Ghost", ["Ghost Town", "Ghost Ship", "Ghost Story", "Holy Ghost", "Friendly Ghost"]],
  ["Fairy", ["Fairy Tale", "Tooth Fairy", "Fairy Dust", "Fairy Ring", "Fairy Queen"]],
  ["Phoenix", ["Fire Phoenix", "Phoenix Feather", "Rising Phoenix"]],
  ["Unicorn", ["Magic Unicorn", "Unicorn Horn", "Baby Unicorn", "Rainbow Unicorn"]],
  ["Angel", ["Guardian Angel", "Fallen Angel", "Angel Wing", "Snow Angel", "Dark Angel"]],
  ["Demon", ["Demon King", "Fire Demon", "Demon Lord", "Speed Demon", "Inner Demon"]],
  ["Vampire", ["Vampire Bat", "Vampire Bite", "Vampire King", "Vampire Slayer"]],
  ["Axe", ["Battle Axe", "War Axe", "Great Axe", "Double Axe"]],
  ["Bow", ["Long Bow", "Cross Bow", "War Bow", "Magic Bow"]],
  ["Gold", ["Dragon Gold", "Gold Coin", "Fools Gold", "Gold Crown"]],
];

export const FANTASY_CARDS: WordCard[] = fromTable(TABLE);
