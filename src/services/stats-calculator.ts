export interface UserStats {
  age: number;
  height: number; // stored in cm internally
  weight: number; // stored in kg internally
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'lose' | 'maintain' | 'gain';
  unitSystem: 'metric' | 'imperial'; // metric (cm/kg) or imperial (ft/lbs)
}

export interface CalculatedGoals {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  bmr: number;
  tdee: number;
}

// Unit conversion utilities
export const UnitConverter = {
  // Height conversions
  cmToFeet: (cm: number): { feet: number; inches: number } => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  },

  feetToFeetAndInches: (feet: number): { feet: number; inches: number } => {
    const wholeFeeet = Math.floor(feet);
    const inches = Math.round((feet - wholeFeeet) * 12);
    return { feet: wholeFeeet, inches };
  },

  feetAndInchesToCm: (feet: number, inches: number): number => {
    return Math.round((feet * 12 + inches) * 2.54);
  },

  // Weight conversions
  kgToLbs: (kg: number): number => {
    return Math.round(kg * 2.20462);
  },

  lbsToKg: (lbs: number): number => {
    return Math.round(lbs / 2.20462 * 100) / 100; // Round to 2 decimals
  },
};

export const StatsCalculator = {
  // Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
  calculateBMR: (stats: UserStats): number => {
    const { age, height, weight, gender } = stats;

    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  },

  // Calculate Total Daily Energy Expenditure
  calculateTDEE: (stats: UserStats): number => {
    const bmr = StatsCalculator.calculateBMR(stats);

    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const tdee = bmr * activityMultipliers[stats.activityLevel];
    return Math.round(tdee);
  },

  // Calculate daily calorie goal based on goal
  calculateDailyCalories: (stats: UserStats): number => {
    const tdee = StatsCalculator.calculateTDEE(stats);

    const adjustments: { [key: string]: number } = {
      lose: -500, // 500 cal deficit = ~0.5kg per week
      maintain: 0,
      gain: 500, // 500 cal surplus = ~0.5kg per week
    };

    const dailyCalories = tdee + adjustments[stats.goal];
    return Math.max(Math.round(dailyCalories), 1200); // Minimum 1200 calories
  },

  // Calculate macro split
  calculateMacros: (stats: UserStats): CalculatedGoals => {
    const bmr = StatsCalculator.calculateBMR(stats);
    const tdee = StatsCalculator.calculateTDEE(stats);
    const dailyCalories = StatsCalculator.calculateDailyCalories(stats);

    // Standard macro split: 30% protein, 40% carbs, 30% fat
    // High protein: 35% protein, 35% carbs, 30% fat
    const macroSplit = stats.goal === 'lose'
      ? { protein: 0.35, carbs: 0.35, fat: 0.30 } // Higher protein for satiety
      : { protein: 0.30, carbs: 0.40, fat: 0.30 };

    return {
      dailyCalories,
      proteinGrams: Math.round((dailyCalories * macroSplit.protein) / 4), // 4 cal per gram
      carbsGrams: Math.round((dailyCalories * macroSplit.carbs) / 4), // 4 cal per gram
      fatGrams: Math.round((dailyCalories * macroSplit.fat) / 9), // 9 cal per gram
      bmr: Math.round(bmr),
      tdee,
    };
  },

  // Get activity level description
  getActivityDescription: (level: string): string => {
    const descriptions: { [key: string]: string } = {
      sedentary: 'Little or no exercise',
      light: 'Exercise 1-3 days/week',
      moderate: 'Exercise 3-5 days/week',
      active: 'Exercise 6-7 days/week',
      veryActive: 'Physical job or training twice per day',
    };
    return descriptions[level] || 'Unknown';
  },

  // Get goal description
  getGoalDescription: (goal: string): string => {
    const descriptions: { [key: string]: string } = {
      lose: 'Weight Loss (500 cal deficit)',
      maintain: 'Weight Maintenance',
      gain: 'Muscle Gain (500 cal surplus)',
    };
    return descriptions[goal] || 'Unknown';
  },
};
