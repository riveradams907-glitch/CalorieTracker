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

/**
 * Macro Calculation Methodology
 * ============================
 *
 * Based on scientific research from:
 * - International Society of Sports Nutrition (ISSN)
 * - Renaissance Periodization
 * - Layne Norton's evidence-based nutrition research
 *
 * PROTEIN (Basis: body weight)
 * - Weight loss: 1.0g per lb (preserves muscle in deficit)
 * - Muscle gain: 0.9g per lb (optimal for hypertrophy)
 * - Maintenance: 0.8g per lb (sufficient for healthy adults)
 * - Max cap: 1.2g per lb (diminishing returns above this)
 *
 * FAT (Basis: body weight & hormone health)
 * - Weight loss: 0.4g per lb (maximizes satiety in deficit)
 * - Muscle gain: 0.35g per lb (supports hormone production)
 * - Maintenance: 0.35g per lb (standard approach)
 * - Range: 0.25-0.5g per lb (hormonal and health boundaries)
 *
 * CARBS (Calculated as remainder)
 * - Most flexible macro, varies by individual tolerance
 * - Fills remaining calories after protein and fat
 * - Minimum 50g for CNS function and fiber
 */

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

  // Calculate macro split using evidence-based approach
  // Based on research from Renaissance Periodization, ISSN, and Layne Norton
  calculateMacros: (stats: UserStats): CalculatedGoals => {
    const bmr = StatsCalculator.calculateBMR(stats);
    const tdee = StatsCalculator.calculateTDEE(stats);
    const dailyCalories = StatsCalculator.calculateDailyCalories(stats);

    // Calculate protein based on body weight and goal
    // Research shows: 0.7-1.0g per lb (1.5-2.2g per kg) is optimal for muscle retention/growth
    const weightLbs = stats.weight * 2.20462;
    let proteinGrams = 0;

    if (stats.goal === 'lose') {
      // Higher protein for satiety and muscle preservation during deficit
      // 1.0g per lb of body weight
      proteinGrams = Math.round(weightLbs * 1.0);
    } else if (stats.goal === 'gain') {
      // Muscle gain requires adequate protein
      // 0.8-1.0g per lb, using 0.9 as balanced approach
      proteinGrams = Math.round(weightLbs * 0.9);
    } else {
      // Maintenance - moderate protein
      // 0.8g per lb
      proteinGrams = Math.round(weightLbs * 0.8);
    }

    // Cap protein at max (upper limit is ~1.2g per lb)
    proteinGrams = Math.min(proteinGrams, Math.round(weightLbs * 1.2));

    // Calculate fats based on goal
    // Research shows minimum 0.25g per lb, maximum 0.5g per lb
    const proteinCalories = proteinGrams * 4;
    let fatGrams = 0;

    if (stats.goal === 'lose') {
      // Higher fat for hormone health and satiety during deficit
      // 0.4g per lb
      fatGrams = Math.round(weightLbs * 0.4);
    } else if (stats.goal === 'gain') {
      // Moderate fat for hormone production and calorie surplus
      // 0.35g per lb
      fatGrams = Math.round(weightLbs * 0.35);
    } else {
      // Maintenance - standard approach
      // 0.35g per lb
      fatGrams = Math.round(weightLbs * 0.35);
    }

    // Clamp fats between 0.25-0.5g per lb (55-110g per 100kg person)
    const minFat = Math.round(weightLbs * 0.25);
    const maxFat = Math.round(weightLbs * 0.5);
    fatGrams = Math.max(minFat, Math.min(fatGrams, maxFat));

    // Remaining calories go to carbs (most flexible macro)
    const fatCalories = fatGrams * 9;
    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbsGrams = Math.round(carbCalories / 4);

    return {
      dailyCalories,
      proteinGrams: Math.max(proteinGrams, 50), // Minimum 50g protein
      carbsGrams: Math.max(carbsGrams, 50), // Minimum 50g carbs
      fatGrams: Math.max(fatGrams, 25), // Minimum 25g fat
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
