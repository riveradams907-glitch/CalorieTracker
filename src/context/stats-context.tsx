import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserStats, CalculatedGoals, StatsCalculator } from '@/services/stats-calculator';

interface StatsContextType {
  stats: UserStats | null;
  goals: CalculatedGoals | null;
  updateStats: (stats: UserStats) => void;
  hasStats: boolean;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const DEFAULT_STATS: UserStats = {
  age: 30,
  height: 170,
  weight: 70,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
};

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStats | null>(DEFAULT_STATS);
  const [goals, setGoals] = useState<CalculatedGoals | null>(
    stats ? StatsCalculator.calculateMacros(stats) : null
  );

  const updateStats = (newStats: UserStats) => {
    setStats(newStats);
    setGoals(StatsCalculator.calculateMacros(newStats));
  };

  return (
    <StatsContext.Provider value={{ stats, goals, updateStats, hasStats: !!stats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return context;
}
