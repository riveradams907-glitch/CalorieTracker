export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp: number;
  userId: string;
}

export interface CommonFood {
  id: string;
  name: string;
  calories: number;
  serving: string;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Mock food database
const COMMON_FOODS: CommonFood[] = [
  { id: '1', name: 'Chicken Breast (100g)', calories: 165, serving: '100g', protein: 31, carbs: 0, fat: 3.6 },
  { id: '2', name: 'Banana', calories: 89, serving: '1 medium', protein: 1.1, carbs: 23, fat: 0.3 },
  { id: '3', name: 'Apple', calories: 52, serving: '1 medium', protein: 0.3, carbs: 14, fat: 0.2 },
  { id: '4', name: 'Brown Rice (cooked)', calories: 111, serving: '100g', protein: 2.6, carbs: 23, fat: 0.9 },
  { id: '5', name: 'Salmon (100g)', calories: 208, serving: '100g', protein: 20, carbs: 0, fat: 13 },
  { id: '6', name: 'Egg', calories: 78, serving: '1 large', protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: '7', name: 'Almonds', calories: 579, serving: '100g', protein: 21, carbs: 22, fat: 50 },
  { id: '8', name: 'Broccoli (cooked)', calories: 34, serving: '100g', protein: 2.8, carbs: 7, fat: 0.4 },
  { id: '9', name: 'Sweet Potato', calories: 86, serving: '100g', protein: 1.6, carbs: 20, fat: 0.1 },
  { id: '10', name: 'Oatmeal (dry)', calories: 389, serving: '100g', protein: 17, carbs: 66, fat: 6.9 },
  { id: '11', name: 'Greek Yogurt', calories: 59, serving: '100g', protein: 10, carbs: 3.2, fat: 0.4 },
  { id: '12', name: 'Peanut Butter', calories: 588, serving: '100g', protein: 25, carbs: 20, fat: 50 },
  { id: '13', name: 'Tuna (canned in water)', calories: 96, serving: '100g', protein: 21, carbs: 0, fat: 1 },
  { id: '14', name: 'Spinach (raw)', calories: 23, serving: '100g', protein: 2.7, carbs: 3.6, fat: 0.4 },
  { id: '15', name: 'Avocado', calories: 160, serving: '100g', protein: 2, carbs: 9, fat: 15 },
];

// Storage simulation (in real app, use AsyncStorage or a backend)
let foodEntries: FoodEntry[] = [];

export const FoodService = {
  // Get common foods for quick selection
  getCommonFoods: (search?: string): CommonFood[] => {
    if (!search) return COMMON_FOODS;
    return COMMON_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  },

  // Add a food entry
  addFoodEntry: (name: string, calories: number, userId: string, protein?: number, carbs?: number, fat?: number): FoodEntry => {
    const entry: FoodEntry = {
      id: Date.now().toString(),
      name,
      calories,
      protein,
      carbs,
      fat,
      timestamp: Date.now(),
      userId,
    };
    foodEntries.push(entry);
    return entry;
  },

  // Get today's entries
  getTodayEntries: (userId: string): FoodEntry[] => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    return foodEntries.filter(
      e => e.userId === userId && e.timestamp >= startOfDay && e.timestamp < endOfDay
    );
  },

  // Get today's total calories
  getTodayCalories: (userId: string): number => {
    return FoodService.getTodayEntries(userId).reduce((sum, entry) => sum + entry.calories, 0);
  },

  // Get all entries (for history)
  getAllEntries: (userId: string): FoodEntry[] => {
    return foodEntries.filter(e => e.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  },

  // Delete an entry
  deleteEntry: (entryId: string) => {
    foodEntries = foodEntries.filter(e => e.id !== entryId);
  },

  // Get entries for a specific date
  getEntriesByDate: (userId: string, date: Date): FoodEntry[] => {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    return foodEntries.filter(
      e => e.userId === userId && e.timestamp >= startOfDay && e.timestamp < endOfDay
    );
  },

  // Get macros for today
  getTodayMacros: (userId: string) => {
    const entries = FoodService.getTodayEntries(userId);
    return {
      protein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
      carbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
      fat: entries.reduce((sum, e) => sum + (e.fat || 0), 0),
    };
  },
};
