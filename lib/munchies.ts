import type { WordCard } from "./types";
import { cross, dedupe, fromTable } from "./gen";

// Munchies: food, drink and tasty treats. Reworked to drop culture-specific
// colloquialisms (no "corner diner", "drive-thru", etc.) — actual dish names,
// including ethnic dishes, are fine. Built from a few flavour/style crosses
// (which read naturally) plus a table of real dishes and treats.

const FLAVOUR = [
  "Chocolate", "Vanilla", "Strawberry", "Caramel", "Mango", "Banana",
  "Coconut", "Coffee", "Lemon", "Peanut", "Mint", "Honey", "Blueberry",
  "Almond", "Pumpkin", "Apple", "Cherry", "Matcha",
];
const TREAT = [
  "Cake", "Ice Cream", "Milkshake", "Smoothie", "Cookie", "Muffin", "Pudding",
  "Tart", "Donut", "Latte", "Cupcake", "Mousse", "Pie", "Cheesecake", "Brownie",
  "Waffle", "Pancake", "Parfait", "Sundae", "Sorbet", "Popsicle",
];

const PROTEIN = ["Chicken", "Beef", "Pork", "Fish", "Prawn", "Tofu", "Lamb", "Duck", "Egg"];
const DISH = [
  "Curry", "Soup", "Stir Fry", "Fried Rice", "Noodles", "Dumpling", "Skewer",
  "Burger", "Taco", "Wrap", "Salad", "Stew", "Pie", "Sandwich", "Roll",
  "Kebab", "Cutlet", "Ball", "Broth", "Pot",
];

const STYLE = [
  "Fried", "Grilled", "Roast", "Baked", "Steamed", "Spicy", "Sweet", "Sour",
  "Crispy", "Smoked", "Stuffed", "Glazed", "Creamy", "Fresh", "Sticky",
];

const DRINK_STYLE = ["Iced", "Hot", "Frozen", "Sparkling", "Fresh", "Cold", "Creamy", "Fizzy"];
const DRINK = ["Lemonade", "Latte", "Smoothie", "Tea", "Coffee", "Cola", "Cider", "Cocoa", "Milk", "Soda", "Mocktail", "Slushie"];
const FOOD = [
  "Chicken", "Fish", "Rice", "Noodles", "Potato", "Dumpling", "Tofu", "Prawn",
  "Egg", "Pork", "Beef", "Mushroom", "Corn", "Bun", "Cabbage",
];

const TABLE: [string, string[]][] = [
  ["Pizza", ["Cheese Pizza", "Pepperoni Pizza", "Deep Dish Pizza", "Thin Crust Pizza", "Veggie Pizza", "Hawaiian Pizza", "Margherita Pizza"]],
  ["Burger", ["Cheese Burger", "Veggie Burger", "Double Burger", "Bacon Burger", "Beef Burger", "Chicken Burger"]],
  ["Rice", ["Fried Rice", "Sticky Rice", "Coconut Rice", "Brown Rice", "Rice Bowl", "Rice Pudding", "Rice Ball", "Egg Rice"]],
  ["Noodle", ["Egg Noodle", "Rice Noodle", "Instant Noodle", "Glass Noodle", "Noodle Soup", "Pad Thai", "Ramen Noodle"]],
  ["Soup", ["Chicken Soup", "Tomato Soup", "Miso Soup", "Onion Soup", "Pumpkin Soup", "Noodle Soup", "Hot Pot", "Corn Soup"]],
  ["Curry", ["Green Curry", "Red Curry", "Yellow Curry", "Butter Chicken", "Chicken Tikka", "Beef Rendang", "Massaman Curry", "Katsu Curry"]],
  ["Roll", ["Spring Roll", "Sushi Roll", "Egg Roll", "Sausage Roll", "Summer Roll", "Cinnamon Roll", "Bread Roll", "Lobster Roll"]],
  ["Dumpling", ["Pork Dumpling", "Soup Dumpling", "Steamed Dumpling", "Fried Dumpling", "Shrimp Dumpling"]],
  ["Bread", ["Garlic Bread", "Flat Bread", "Naan Bread", "Banana Bread", "Corn Bread", "Sour Dough", "Milk Bread", "Pita Bread"]],
  ["Egg", ["Fried Egg", "Boiled Egg", "Scrambled Egg", "Poached Egg", "Egg Tart", "Century Egg", "Deviled Egg", "Egg Drop Soup"]],
  ["Cheese", ["Grilled Cheese", "Blue Cheese", "Cream Cheese", "Cheese Board", "Mac And Cheese", "String Cheese", "Goat Cheese"]],
  ["Chicken", ["Fried Chicken", "Roast Chicken", "Chicken Wing", "Chicken Rice", "Kung Pao Chicken", "Chicken Satay", "Chicken Nugget", "Butter Chicken"]],
  ["Taco", ["Fish Taco", "Beef Taco", "Soft Taco", "Taco Salad", "Breakfast Taco"]],
  ["Coffee", ["Iced Coffee", "Black Coffee", "Flat White", "Cold Brew", "Coffee Bean", "Espresso Shot", "Caramel Latte"]],
  ["Tea", ["Green Tea", "Milk Tea", "Bubble Tea", "Iced Tea", "Herbal Tea", "Ginger Tea", "Tea Pot", "Chai Latte"]],
  ["Cake", ["Sponge Cake", "Carrot Cake", "Lava Cake", "Fish Cake", "Rice Cake", "Fruit Cake", "Layer Cake", "Mooncake"]],
  ["Chocolate", ["Dark Chocolate", "White Chocolate", "Hot Chocolate", "Chocolate Bar", "Chocolate Chip", "Milk Chocolate"]],
  ["Potato", ["Mashed Potato", "Baked Potato", "Sweet Potato", "Potato Chip", "Potato Salad", "French Fries", "Hash Brown", "Potato Wedge"]],
  ["Fruit", ["Fruit Salad", "Fruit Cup", "Dragon Fruit", "Passion Fruit", "Star Fruit", "Fruit Smoothie", "Fruit Tart"]],
  ["Pancake", ["Fluffy Pancake", "Potato Pancake", "Scallion Pancake", "Silver Dollar Pancake", "Pancake Stack"]],
  ["Sauce", ["Soy Sauce", "Hot Sauce", "Fish Sauce", "Chilli Sauce", "Tomato Sauce", "Sweet Sauce", "Peanut Sauce", "Tartar Sauce"]],
  ["Sushi", ["Sushi Roll", "Nigiri Sushi", "Sushi Bar", "Salmon Sushi", "Sushi Platter"]],
  ["Ice", ["Shaved Ice", "Ice Cream", "Ice Lolly", "Ice Cube", "Ice Kacang", "Ice Pop"]],
  ["Bun", ["Steamed Bun", "Pork Bun", "Custard Bun", "Hot Cross Bun", "Sticky Bun", "Bao Bun"]],
  ["Pie", ["Apple Pie", "Meat Pie", "Pumpkin Pie", "Chicken Pie", "Key Lime Pie", "Shepherd's Pie", "Pecan Pie"]],
  ["Snack", ["Potato Chip", "Corn Chip", "Trail Mix", "Popcorn Bag", "Pretzel Twist", "Rice Cracker", "Prawn Cracker"]],
  ["Juice", ["Orange Juice", "Apple Juice", "Sugar Cane Juice", "Watermelon Juice", "Carrot Juice", "Mango Juice"]],
  ["Grill", ["Barbecue Ribs", "Grilled Corn", "Beef Skewer", "Satay Stick", "Grilled Squid", "Char Siew"]],
];

export const MUNCHIES_CARDS: WordCard[] = dedupe([
  ...cross(FLAVOUR, TREAT),
  ...cross(PROTEIN, DISH),
  ...cross(STYLE, FOOD),
  ...cross(DRINK_STYLE, DRINK),
  ...fromTable(TABLE),
]);
