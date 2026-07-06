import type { WordCard } from "./types";
import { cross, dedupe, fromTable } from "./gen";

// Fantasy: magic, dragons, elves, medieval. Built mostly from an
// adjective × noun cross-product (adjective+noun reads naturally), plus a
// table of iconic fantasy compounds for extra flavour.

const ADJ = [
  "Ancient", "Arcane", "Blessed", "Crimson", "Cursed", "Dark", "Dread",
  "Dwarven", "Elven", "Enchanted", "Eternal", "Fabled", "Fallen", "Feral",
  "Fire", "Forbidden", "Forgotten", "Frost", "Frozen", "Giant", "Gilded",
  "Golden", "Grim", "Hidden", "Holy", "Ice", "Infernal", "Iron", "Lost",
  "Mystic", "Noble", "Phantom", "Poison", "Royal", "Sacred", "Savage",
  "Shadow", "Silver", "Spectral", "Storm", "Thunder", "Undead", "Wicked",
  "Wild", "Winged", "Emerald", "Blazing", "Runed",
];

const NOUN = [
  "Dragon", "Wizard", "Sword", "Shield", "Castle", "Knight", "Elf", "Dwarf",
  "Goblin", "Troll", "Ogre", "Witch", "Wand", "Crown", "Throne", "Blade",
  "Bow", "Axe", "Staff", "Cloak", "Ring", "Amulet", "Crystal", "Portal",
  "Realm", "Beast", "Curse", "Quest", "Dungeon", "Gate", "Tower", "Griffin",
  "Phoenix", "Unicorn", "Kraken", "Wolf", "Raven", "Serpent", "Demon", "Angel",
  "Ghost", "Fairy", "Mage", "Orc", "Vampire", "Warrior", "Queen", "King",
];

const TABLE: [string, string[]][] = [
  ["Dragon", ["Dragon Fire", "Dragon Rider", "Dragon Slayer", "Dragon Egg", "Dragon Scale", "Dragon Lord", "Baby Dragon", "Two Headed Dragon"]],
  ["Sword", ["Magic Sword", "Broad Sword", "Long Sword", "Sword Fight", "Sword Master", "Flaming Sword", "Great Sword"]],
  ["Spell", ["Spell Book", "Magic Spell", "Curse Spell", "Fire Spell", "Ice Spell", "Sleeping Spell", "Broken Spell", "Counter Spell"]],
  ["Potion", ["Magic Potion", "Healing Potion", "Love Potion", "Poison Potion", "Invisible Potion", "Potion Bottle"]],
  ["Wizard", ["Wizard Hat", "Wizard Tower", "Battle Wizard", "Wizard Staff", "Grand Wizard"]],
  ["Knight", ["Dark Knight", "White Knight", "Knight Errant", "Round Table Knight", "Dragon Knight"]],
  ["Castle", ["Castle Gate", "Castle Wall", "Sand Castle", "Floating Castle", "Haunted Castle", "Castle Keep", "Castle Moat"]],
  ["Magic", ["Black Magic", "White Magic", "Blood Magic", "Magic Carpet", "Magic Mirror", "Magic Ring", "Magic Bean", "Dark Magic"]],
  ["Elf", ["Wood Elf", "High Elf", "Night Elf", "Elf King", "Dark Elf"]],
  ["Giant", ["Frost Giant", "Fire Giant", "Stone Giant", "Cloud Giant", "Hill Giant", "Storm Giant"]],
  ["King", ["Goblin King", "Lich King", "Sorcerer King", "Boy King", "Warrior King"]],
  ["Beast", ["Fell Beast", "Dire Beast", "Horned Beast", "Sea Beast", "Shadow Beast"]],
  ["Rune", ["Rune Stone", "Rune Sword", "Rune Magic", "Rune Master", "Blood Rune"]],
  ["Witch", ["Witch Hat", "Witch Craft", "Sea Witch", "Snow Witch", "Witch Hunt", "Night Witch"]],
  ["Wolf", ["Were Wolf", "Dire Wolf", "Shadow Wolf", "Frost Wolf", "Wolf Pack"]],
  ["Forest", ["Dark Forest", "Elven Forest", "Haunted Forest", "Enchanted Forest", "Whispering Forest"]],
  ["Tower", ["Wizard Tower", "Dark Tower", "Bell Tower", "Watch Tower", "Ivory Tower"]],
  ["Book", ["Spell Book", "Book Of Shadows", "Tome Of Magic", "Forbidden Book"]],
  ["Fire", ["Wild Fire", "Dragon Fire", "Hell Fire", "Soul Fire", "Blue Fire", "Witch Fire"]],
  ["Crown", ["Iron Crown", "Broken Crown", "Golden Crown", "Thorn Crown", "Ghost Crown"]],
];

export const FANTASY_CARDS: WordCard[] = dedupe([
  ...cross(ADJ, NOUN),
  ...fromTable(TABLE),
]);
