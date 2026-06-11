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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Modern Gradient Header */}
          <ThemedView style={styles.header}>
            <ThemedText style={styles.greeting}>Welcome back, {user?.name.split(' ')[0]}! 🎯</ThemedText>
            <ThemedText style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</ThemedText>
          </ThemedView>

          {/* Main Calorie Card - Circular Progress */}
          <ThemedView style={styles.mainCard}>
            <ThemedView style={styles.circleSection}>
              <View style={styles.circleOuter}>
                <View style={[styles.circleProgress, { borderTopColor: '#6366F1', borderRightColor: '#6366F1', transform: [{ rotate: `${(caloriePercentage / 100) * 360}deg` }] }]} />
                <View style={styles.circleInner}>
                  <ThemedText style={styles.calorieMainText}>{totalCalories}</ThemedText>
                  <ThemedText style={styles.calorieSubtext}>cal</ThemedText>
                </View>
              </View>
              <ThemedView style={styles.circleInfo}>
                <ThemedText style={styles.goalText}>Daily Goal: {settings.dailyCalorieGoal}</ThemedText>
                <ThemedText style={styles.remainingText}>
                  {remainingCalories > 0
                    ? `${Math.round(remainingCalories)} left`
                    : `${Math.abs(Math.round(remainingCalories))} over`}
                </ThemedText>
                <View style={styles.progressBar}>
                  <View style={[styles.progressBarFill, { width: `${caloriePercentage}%` }]} />
                </View>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Macro Cards - Modern Design */}
          <ThemedView style={styles.macroRow}>
            <MacroCard
              label="Protein"
              current={Math.round(macros.protein)}
              goal={settings.proteinGoal}
              color="#EC4899"
              icon="🥚"
            />
            <MacroCard
              label="Carbs"
              current={Math.round(macros.carbs)}
              goal={settings.carbsGoal}
              color="#3B82F6"
              icon="🌾"
            />
            <MacroCard
              label="Fat"
              current={Math.round(macros.fat)}
              goal={settings.fatGoal}
              color="#F59E0B"
              icon="🥑"
            />
          </ThemedView>

          {/* Quick Action Buttons */}
          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/add-food')}>
              <ThemedText style={styles.primaryButtonText}>+ Add Food</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(tabs)/photo')}>
              <ThemedText style={styles.secondaryButtonText}>📸 Snap Photo</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Food Log */}
          <ThemedView style={styles.foodLogSection}>
            <ThemedText style={styles.sectionTitle}>Today's Meals</ThemedText>
            {todayEntries.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyEmoji}>🍽️</ThemedText>
                <ThemedText style={styles.emptyText}>No meals logged yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>Tap + Add Food to get started</ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={todayEntries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ThemedView style={styles.foodItem}>
                    <ThemedView style={styles.foodItemLeft}>
                      <View style={styles.foodIcon}>
                        <ThemedText style={styles.foodIconEmoji}>🍜</ThemedText>
                      </View>
                      <ThemedView style={styles.foodDetails}>
                        <ThemedText style={styles.foodName}>{item.name}</ThemedText>
                        <ThemedText style={styles.foodMacros}>
                          P: {Math.round(item.protein || 0)}g | C: {Math.round(item.carbs || 0)}g | F: {Math.round(item.fat || 0)}g
                        </ThemedText>
                        <ThemedText style={styles.foodTime}>
                          {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                    <ThemedView style={styles.foodItemRight}>
                      <ThemedText style={styles.foodCalories}>{item.calories}</ThemedText>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteEntry(item.id)}>
                        <ThemedText style={styles.deleteBtnText}>×</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                )}
              />
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MacroCard({ label, current, goal, color, icon }: any) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <ThemedView style={[styles.macroCard, { borderTopColor: color }]}>
      <ThemedText style={styles.macroIcon}>{icon}</ThemedText>
      <ThemedText style={styles.macroLabel}>{label}</ThemedText>
      <ThemedText style={styles.macroValue}>{current}g</ThemedText>
      <ThemedText style={styles.macroGoal}>Goal: {goal}g</ThemedText>
      <View style={styles.macroProgressBar}>
        <View style={[styles.macroProgressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <ThemedText style={styles.macroPercent}>{Math.round(percentage)}%</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: Spacing.one,
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  circleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  circleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circleProgress: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderTopColor: '#6366F1',
    borderRightColor: '#6366F1',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  circleInner: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  calorieMainText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1F2937',
  },
  calorieSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  circleInfo: {
    flex: 1,
  },
  goalText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  remainingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: Spacing.two,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  macroIcon: {
    fontSize: 28,
    marginBottom: Spacing.one,
  },
  macroLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: Spacing.half,
  },
  macroValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: Spacing.half,
  },
  macroGoal: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: Spacing.one,
  },
  macroProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.one,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  foodLogSection: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: Spacing.three,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.four,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: Spacing.one,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  foodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodIconEmoji: {
    fontSize: 24,
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: Spacing.half,
  },
  foodMacros: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: Spacing.half,
  },
  foodTime: {
    fontSize: 10,
    color: '#D1D5DB',
  },
  foodItemRight: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6366F1',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '700',
  },
});
