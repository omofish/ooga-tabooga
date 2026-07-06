import type { WordCard } from "./types";
import { fromTable } from "./gen";

// Munchies: food, drink and tasty treats. Curated real dishes only — each hard
// phrase is a genuine food/drink term that contains the easy word. Ethnic
// dishes are welcome; culture-specific slang venues are not.

const TABLE: [string, string[]][] = [
  ["Pizza", ["Cheese Pizza", "Pepperoni Pizza", "Deep Dish Pizza", "Pizza Slice", "Pizza Oven", "Veggie Pizza"]],
  ["Burger", ["Cheese Burger", "Beef Burger", "Veggie Burger", "Bacon Burger", "Chicken Burger", "Burger Bun"]],
  ["Rice", ["Fried Rice", "Sticky Rice", "Rice Bowl", "Rice Ball", "Rice Pudding", "Egg Rice", "Rice Cake", "Brown Rice", "Rice Paper"]],
  ["Noodle", ["Egg Noodle", "Rice Noodle", "Instant Noodle", "Noodle Soup", "Glass Noodle", "Noodle Bowl"]],
  ["Soup", ["Chicken Soup", "Tomato Soup", "Onion Soup", "Pumpkin Soup", "Corn Soup", "Miso Soup", "Soup Bowl", "Noodle Soup"]],
  ["Chicken", ["Fried Chicken", "Roast Chicken", "Chicken Wing", "Chicken Rice", "Chicken Soup", "Chicken Nugget", "Butter Chicken", "Chicken Curry", "Chicken Pie", "Chicken Satay"]],
  ["Egg", ["Fried Egg", "Boiled Egg", "Scrambled Egg", "Egg Tart", "Egg Roll", "Deviled Egg", "Egg Sandwich", "Egg Custard"]],
  ["Cheese", ["Grilled Cheese", "Blue Cheese", "Cream Cheese", "Cheese Cake", "Cheese Board", "String Cheese", "Cheese Ball"]],
  ["Cake", ["Sponge Cake", "Carrot Cake", "Cheese Cake", "Rice Cake", "Cup Cake", "Birthday Cake", "Fish Cake", "Fruit Cake", "Chocolate Cake", "Lava Cake"]],
  ["Chocolate", ["Dark Chocolate", "White Chocolate", "Hot Chocolate", "Chocolate Bar", "Chocolate Chip", "Chocolate Cake", "Milk Chocolate"]],
  ["Potato", ["Mashed Potato", "Baked Potato", "Sweet Potato", "Potato Chip", "Potato Salad", "Potato Wedge"]],
  ["Bread", ["Garlic Bread", "Flat Bread", "Banana Bread", "Corn Bread", "Bread Roll", "White Bread", "Bread Stick", "Ginger Bread"]],
  ["Pie", ["Apple Pie", "Meat Pie", "Pumpkin Pie", "Chicken Pie", "Pecan Pie", "Pie Crust"]],
  ["Roll", ["Spring Roll", "Egg Roll", "Sausage Roll", "Sushi Roll", "Cinnamon Roll", "Bread Roll", "Summer Roll"]],
  ["Curry", ["Green Curry", "Red Curry", "Chicken Curry", "Fish Curry", "Curry Puff", "Curry Sauce"]],
  ["Fish", ["Fish Cake", "Fish Ball", "Fish Finger", "Fish Pie", "Fried Fish", "Fish Taco", "Fish Soup"]],
  ["Tea", ["Green Tea", "Milk Tea", "Bubble Tea", "Iced Tea", "Herbal Tea", "Ginger Tea", "Tea Pot", "Tea Cup", "Sweet Tea"]],
  ["Coffee", ["Iced Coffee", "Black Coffee", "Coffee Bean", "Coffee Cup", "Coffee Cake", "Coffee Shop", "Coffee Pot"]],
  ["Milk", ["Milk Shake", "Milk Tea", "Warm Milk", "Milk Bar", "Coconut Milk", "Almond Milk", "Milk Bottle"]],
  ["Ice", ["Ice Cream", "Ice Cube", "Shaved Ice", "Ice Lolly", "Ice Pop", "Iced Tea"]],
  ["Cream", ["Ice Cream", "Whipped Cream", "Sour Cream", "Cream Puff", "Cream Cheese", "Cream Soda"]],
  ["Sauce", ["Soy Sauce", "Hot Sauce", "Fish Sauce", "Tomato Sauce", "Sweet Sauce", "Chilli Sauce", "Peanut Sauce"]],
  ["Juice", ["Orange Juice", "Apple Juice", "Fruit Juice", "Grape Juice", "Juice Box", "Carrot Juice"]],
  ["Bun", ["Steamed Bun", "Pork Bun", "Sticky Bun", "Hot Cross Bun", "Custard Bun"]],
  ["Dumpling", ["Pork Dumpling", "Soup Dumpling", "Fried Dumpling", "Steamed Dumpling", "Shrimp Dumpling"]],
  ["Fruit", ["Fruit Salad", "Fruit Cup", "Fruit Tart", "Fruit Juice", "Dragon Fruit", "Star Fruit", "Passion Fruit", "Fruit Cake"]],
  ["Salad", ["Fruit Salad", "Potato Salad", "Green Salad", "Egg Salad", "Caesar Salad", "Salad Bowl", "Salad Bar"]],
  ["Sandwich", ["Egg Sandwich", "Club Sandwich", "Ham Sandwich", "Ice Cream Sandwich", "Sandwich Bread"]],
  ["Beef", ["Beef Burger", "Beef Stew", "Roast Beef", "Beef Noodle", "Ground Beef", "Beef Rendang", "Corned Beef", "Beef Ball"]],
  ["Pork", ["Pork Chop", "Pork Bun", "Pork Belly", "Roast Pork", "Pork Ball", "Pulled Pork", "Pork Rib"]],
  ["Corn", ["Sweet Corn", "Corn Bread", "Pop Corn", "Corn Dog", "Corn Chip", "Corn Soup", "Corn Cob"]],
  ["Toast", ["French Toast", "Kaya Toast", "Garlic Toast", "Cheese Toast", "Toast Bread"]],
  ["Pancake", ["Potato Pancake", "Fluffy Pancake", "Pancake Stack", "Pancake Batter"]],
  ["Wrap", ["Chicken Wrap", "Veggie Wrap", "Tortilla Wrap", "Wrap Roll"]],
  ["Taco", ["Fish Taco", "Beef Taco", "Soft Taco", "Taco Salad", "Taco Shell"]],
];

export const MUNCHIES_CARDS: WordCard[] = fromTable(TABLE);
