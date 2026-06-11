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

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Start strong today!';
    if (hour < 17) return '💪 Keep the momentum!';
    return '🌙 Finish the day right!';
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Fitness Hero Banner */}
          <ThemedView style={styles.heroBanner}>
            <ThemedView style={styles.heroContent}>
              <ThemedText style={styles.heroMessage}>{getMotivationalMessage()}</ThemedText>
              <ThemedText style={styles.heroName}>{user?.name.split(' ')[0]}</ThemedText>
              <ThemedText style={styles.heroSubtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.heroEmoji}>
              <ThemedText style={styles.heroBigEmoji}>🏋️</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Main Calorie Card - Enhanced */}
          <ThemedView style={styles.calorieCard}>
            <ThemedView style={styles.calorieTop}>
              <ThemedView>
                <ThemedText style={styles.calorieLabel}>ENERGY BURNED TODAY</ThemedText>
                <ThemedView style={styles.calorieValues}>
                  <ThemedText style={styles.calorieMain}>{totalCalories}</ThemedText>
                  <ThemedText style={styles.calorieGoal}>/ {settings.dailyCalorieGoal}</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.calorieEmoji}>
                <ThemedText style={styles.emoji}>🔥</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Enhanced Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${caloriePercentage}%` }]} />
            </View>

            {/* Remaining Calories */}
            <ThemedView style={styles.calorieFooter}>
              <ThemedText style={styles.remaining}>
                {remainingCalories > 0 ? `${Math.round(remainingCalories)} left to crush` : '✓ Goal achieved!'}
              </ThemedText>
              <ThemedText style={styles.percentage}>{Math.round(caloriePercentage)}%</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Quick Stats Cards */}
          <ThemedView style={styles.statsRow}>
            <StatCard label="Protein" value={Math.round(macros.protein)} goal={settings.proteinGoal} emoji="🥚" bgColor="#FF6B6B" />
            <StatCard label="Carbs" value={Math.round(macros.carbs)} goal={settings.carbsGoal} emoji="🌾" bgColor="#4ECDC4" />
            <StatCard label="Fat" value={Math.round(macros.fat)} goal={settings.fatGoal} emoji="🥑" bgColor="#FFE66D" />
          </ThemedView>

          {/* Fitness Action Section */}
          <ThemedView style={styles.actionSection}>
            <ThemedText style={styles.actionSectionTitle}>Quick Actions</ThemedText>
            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.addFoodButton]}
                onPress={() => router.push('/(tabs)/add-food')}
              >
                <ThemedText style={styles.actionButtonEmoji}>➕</ThemedText>
                <ThemedView>
                  <ThemedText style={styles.actionButtonText}>Add Food</ThemedText>
                  <ThemedText style={styles.actionButtonSubtext}>Search database</ThemedText>
                </ThemedView>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.photoButton]}
                onPress={() => router.push('/(tabs)/photo')}
              >
                <ThemedText style={styles.actionButtonEmoji}>📸</ThemedText>
                <ThemedView>
                  <ThemedText style={styles.actionButtonText}>Scan Meal</ThemedText>
                  <ThemedText style={styles.actionButtonSubtext}>AI powered</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Macros Breakdown Section */}
          <ThemedText style={styles.macroSectionTitle}>Macronutrients Breakdown</ThemedText>
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

          {/* Today's Log Section */}
          <ThemedView style={styles.logSection}>
            <ThemedText style={styles.logSectionTitle}>📋 Today's Log</ThemedText>

          {todayEntries.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyEmoji}>🍽️</ThemedText>
              <ThemedText style={styles.emptyText}>Your plate is empty</ThemedText>
              <ThemedText style={styles.emptySubtext}>Time to fuel your workout!</ThemedText>
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

function StatCard({ label, value, goal, emoji, bgColor }: any) {
  const percentage = Math.min((value / goal) * 100, 100);

  return (
    <ThemedView style={[styles.statCard, { backgroundColor: bgColor }]}>
      <ThemedText style={styles.statEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.statValue}>{value}g</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedView style={styles.statMini}>
        <ThemedText style={styles.statMiniText}>{Math.round(percentage)}%</ThemedText>
      </ThemedView>
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
  heroBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    flex: 1,
  },
  heroMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginBottom: Spacing.one,
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.half,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  heroEmoji: {
    marginLeft: Spacing.three,
  },
  heroBigEmoji: {
    fontSize: 48,
  },
  calorieCard: {
    backgroundColor: '#667eea',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: Spacing.half,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
  },
  statMini: {
    marginTop: Spacing.one,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  statMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  actionSection: {
    marginBottom: Spacing.four,
  },
  actionSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  macroSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    color: '#667eea',
  },
  logSection: {
    marginTop: Spacing.three,
  },
  logSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  macrosGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  macroCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(102, 126, 234, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: Spacing.two,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  addFoodButton: {
    backgroundColor: '#4ECDC4',
  },
  photoButton: {
    backgroundColor: '#FFE66D',
  },
  actionButtonEmoji: {
    fontSize: 24,
    marginTop: Spacing.half,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionButtonSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.half,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: Spacing.three,
    marginVertical: Spacing.four,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
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
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '700',
    fontSize: 15,
    marginBottom: Spacing.one,
    color: '#667eea',
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
