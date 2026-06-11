import { StyleSheet, TouchableOpacity, ScrollView, FlatList, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { FoodService, FoodEntry } from '@/services/food-service';
import { Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const entries = FoodService.getTodayEntries(user.id);
        const calories = FoodService.getTodayCalories(user.id);
        const macrosData = FoodService.getTodayMacros(user.id);

        setTodayEntries(entries);
        setTotalCalories(calories);
        setMacros(macrosData);
      }
    }, [user])
  );

  const remainingCalories = settings.dailyCalorieGoal - totalCalories;
  const caloriePercentage = Math.min((totalCalories / settings.dailyCalorieGoal) * 100, 100);

  const handleDeleteEntry = (entryId: string) => {
    FoodService.deleteEntry(entryId);
    if (user) {
      const entries = FoodService.getTodayEntries(user.id);
      const calories = FoodService.getTodayCalories(user.id);
      const macrosData = FoodService.getTodayMacros(user.id);
      setTodayEntries(entries);
      setTotalCalories(calories);
      setMacros(macrosData);
    }
  };

  const getMacroPercentage = (value: number, goal: number) => {
    return Math.min((value / goal) * 100, 100);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedView>
              <ThemedText style={styles.greeting}>Hi, {user?.name.split(' ')[0]}! 👋</ThemedText>
              <ThemedText style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Main Calorie Card */}
          <ThemedView style={styles.calorieCard}>
            <ThemedView style={styles.calorieTop}>
              <ThemedView>
                <ThemedText style={styles.calorieLabel}>Daily Calories</ThemedText>
                <ThemedView style={styles.calorieValues}>
                  <ThemedText style={styles.calorieMain}>{totalCalories}</ThemedText>
                  <ThemedText style={styles.calorieGoal}>/ {settings.dailyCalorieGoal}</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.calorieEmoji}>
                <ThemedText style={styles.emoji}>🔥</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${caloriePercentage}%` }]} />
            </View>

            {/* Remaining Calories */}
            <ThemedView style={styles.calorieFooter}>
              <ThemedText style={styles.remaining}>
                {remainingCalories > 0 ? `${Math.round(remainingCalories)} calories left` : '✓ Goal reached!'}
              </ThemedText>
              <ThemedText style={styles.percentage}>{Math.round(caloriePercentage)}%</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Macros Section */}
          <ThemedText style={styles.sectionTitle}>Macronutrients</ThemedText>
          <ThemedView style={styles.macrosGrid}>
            <MacroCard
              label="Protein"
              current={Math.round(macros.protein)}
              goal={settings.proteinGoal}
              emoji="🥚"
              color="#FF6B6B"
            />
            <MacroCard
              label="Carbs"
              current={Math.round(macros.carbs)}
              goal={settings.carbsGoal}
              emoji="🌾"
              color="#4ECDC4"
            />
            <MacroCard
              label="Fat"
              current={Math.round(macros.fat)}
              goal={settings.fatGoal}
              emoji="🥑"
              color="#FFE66D"
            />
          </ThemedView>

          {/* Action Buttons */}
          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addFoodButton]}
              onPress={() => router.push('/(tabs)/add-food')}
            >
              <ThemedText style={styles.actionButtonEmoji}>➕</ThemedText>
              <ThemedText style={styles.actionButtonText}>Add Food</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.photoButton]}
              onPress={() => router.push('/(tabs)/photo')}
            >
              <ThemedText style={styles.actionButtonEmoji}>📸</ThemedText>
              <ThemedText style={styles.actionButtonText}>Scan</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Today's Entries */}
          <ThemedText style={styles.sectionTitle}>Today's Log</ThemedText>

          {todayEntries.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyEmoji}>🍽️</ThemedText>
              <ThemedText style={styles.emptyText}>No food logged yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Start tracking your meals!</ThemedText>
            </ThemedView>
          ) : (
            <>
              <FlatList
                scrollEnabled={false}
                data={todayEntries}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <ThemedView style={styles.entryItem}>
                    <ThemedView style={styles.entryLeft}>
                      <ThemedView style={styles.entryIcon}>
                        <ThemedText style={styles.entryIconEmoji}>🍜</ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.entryDetails}>
                        <ThemedText style={styles.entryName}>{item.name}</ThemedText>
                        <ThemedText style={styles.entryMacros}>
                          P: {Math.round(item.protein || 0)}g • C: {Math.round(item.carbs || 0)}g • F: {Math.round(item.fat || 0)}g
                        </ThemedText>
                        <ThemedText style={styles.entryTime}>
                          {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                    <ThemedView style={styles.entryRight}>
                      <ThemedText style={styles.entryCalories}>{item.calories}</ThemedText>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteEntry(item.id)}
                      >
                        <ThemedText style={styles.deleteButtonText}>×</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                )}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MacroCard({ label, current, goal, emoji, color }: any) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <ThemedView style={styles.macroCard}>
      <ThemedView style={styles.macroHeader}>
        <ThemedText style={styles.macroEmoji}>{emoji}</ThemedText>
        <ThemedText style={styles.macroLabel}>{label}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.macroValue}>
        <ThemedText style={styles.macroAmount}>{current}g</ThemedText>
        <ThemedText style={styles.macroGoal}>/{goal}g</ThemedText>
      </ThemedView>

      <View style={styles.macroBar}>
        <View
          style={[styles.macroBarFill, { width: `${percentage}%`, backgroundColor: color }]}
        />
      </View>

      <ThemedText style={styles.macroPercent}>{Math.round(percentage)}%</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
  },
  calorieCard: {
    backgroundColor: '#667eea',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  calorieTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  calorieLabel: {
    fontSize: 12,
    opacity: 0.8,
    textTransform: 'uppercase',
    color: '#fff',
    fontWeight: '600',
  },
  calorieValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.one,
  },
  calorieMain: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  calorieGoal: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: Spacing.one,
  },
  calorieEmoji: {
    fontSize: 40,
  },
  emoji: {
    fontSize: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  calorieFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remaining: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  percentage: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
  },
  macrosGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  macroCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  macroEmoji: {
    fontSize: 24,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  macroValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  macroAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  macroGoal: {
    fontSize: 12,
    opacity: 0.6,
  },
  macroBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.one,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroPercent: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addFoodButton: {
    backgroundColor: '#4ECDC4',
  },
  photoButton: {
    backgroundColor: '#FFE66D',
  },
  actionButtonEmoji: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  entryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryIconEmoji: {
    fontSize: 24,
  },
  entryDetails: {
    flex: 1,
  },
  entryName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: Spacing.one,
  },
  entryMacros: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  entryTime: {
    fontSize: 11,
    opacity: 0.5,
  },
  entryRight: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  entryCalories: {
    fontWeight: '700',
    fontSize: 16,
    color: '#667eea',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '600',
  },
});
